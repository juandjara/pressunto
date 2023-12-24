import type { ParsedFile } from "./github"
import { FileMode, commitAndPush, deleteFile, getFileContent, getRepoFiles, saveFile } from "./github"
import { getBasename, getDirname, isMarkdown } from "./pathUtils"
import matter from 'front-matter'
import { deleteFileCache } from "./cache.server"
import { withRedis } from "./redis.server"

export type Project = {
  id: number
  user: string
  title: string
  repo: string
  branch: string
}

export type ProjectCollection = {
  id: string
  name: string
  route: string
  template: string
}

export type ProjectTemplates = {
  id: string
  name: string
  fields: FieldConfig[]
}

export type FieldConfig = {
  name: string
  field: string
  default: string
  hidden: boolean
}

export type ProjectConfig = {
  mediaFolder?: string
  collections: ProjectCollection[]
  templates: ProjectTemplates[]
}

const NEXT_PROJECT_KEY = 'next_project_id'

export async function getUserProjects(user: string) {
  return withRedis(async (db) => {
    const ids = await db.smembers(`projects:${user}`)
    if (ids.length === 0) {
      return []
    }
  
    const projects = await db.mget(...ids.map(id => `project:${id}`))
    return projects
      .filter((p) => p)
      .map((p) => JSON.parse(p!) as Project)
      .sort((a, b) => a.title.localeCompare(b.title))
  })
}

export async function getProject(id: number) {
  return withRedis<Project>(async (db) => {
    const data = await db.get(`project:${id}`)
    return data && JSON.parse(data)
  })
}

export async function getIdForRepo(repo: string) {
  return withRedis(async (db) => {
    const data = await db.get(`repo:${repo}`)
    return data ? Number(data) : null
  })
}

export async function createProject(project: Omit<Project, 'id'>) {
  return withRedis(async (db) => {
    const id = await db.incr(NEXT_PROJECT_KEY)
    await Promise.all([
      db.sadd(`projects:${project.user}`, id),
      db.set(`project:${id}`, JSON.stringify({ ...project, id })),
      db.set(`repo:${project.repo}`, id)
    ])
  
    return id
  })
}

export async function updateProject(project: Project) {
  return withRedis(async (db) => {
    await db.set(`project:${project.id}`, JSON.stringify(project))
  })
}

export async function deleteProject(project: Project) {
  return withRedis(async (db) => {
    const deleteDraftsCommand = db.pipeline()
    const draftKeys = await db.smembers(`drafts:${project.repo}`)
    draftKeys.forEach((key) => deleteDraftsCommand.del(key))
    await deleteDraftsCommand.exec()

    await Promise.all([
      db.srem(`projects:${project.user}`, project.id),
      db.del(`project:${project.id}`),
      db.del(`repo:${project.repo}`),
      db.del(`drafts:${project.repo}`),
    ])
  })
}

export const CONFIG_FILE_NAME = 'pressunto.config.json'
export const CONFIG_FILE_TEMPLATE = `{
  "collections": [],
  "templates": []
}
`

export async function createConfigFile(token: string, repo: string, branch: string) {
  const repoTree = await getRepoFiles(token, repo, branch)
  const configFile = repoTree.find((f) => f.path === CONFIG_FILE_NAME)
  if (configFile) {
    return
  }

  await saveFile(token, {
    repo,
    branch,
    path: CONFIG_FILE_NAME,
    content: CONFIG_FILE_TEMPLATE,
    message: '[skip ci] Create config file for Pressunto',
  })
}

export async function updateConfigFile(token: string, project: Project, config: ProjectConfig) {
  const file = await getFileContent(token, {
    file: CONFIG_FILE_NAME,
    repo: project.repo,
    branch: project.branch
  })
  await saveFile(token, {
    sha: file?.sha,
    repo: project.repo,
    branch: project.branch || 'master',
    path: CONFIG_FILE_NAME,
    content: JSON.stringify(config, null, 2),
    message: '[skip ci] Update config file for Pressunto',
  })
}

export async function deleteConfigFile(token: string, { repo, branch }: Project) {
  const file = await getFileContent(token, {
    file: CONFIG_FILE_NAME,
    repo,
    branch,
  })

  if (file) {
    await deleteFile(token, {
      repo,
      branch,
      message: '[skip ci] Delete config file for Pressunto',
      path: CONFIG_FILE_NAME,
    })
  }
}

export async function getProjectConfig(token: string, project: Project) {
  const file = await getFileContent(token, {
    file: CONFIG_FILE_NAME,
    repo: project.repo,
    branch: project.branch
  })

  return JSON.parse(file?.content || CONFIG_FILE_TEMPLATE) as ProjectConfig
}

export type CollectionFile = {
  id: string
  title: string
  path: string
  attributes: Record<string, string | number>
  body: string
}

export function processFileContent(fileContent: Pick<ParsedFile, 'content' | 'sha' | 'path'>) {
  const data = matter<{ title: string; order: number }>(fileContent.content)
  const title = data.attributes.title || getBasename(fileContent.path)
  return {
    id: fileContent.sha,
    title,
    path: fileContent.path,
    attributes: data.attributes,
    body: data.body
  }
}

export async function getCollectionFiles(token: string, project: Project, collection: ProjectCollection, includeBody = false) {
  const tree = await getRepoFiles(token, project.repo, project.branch)
  const collectionTree = tree.filter((f) => {
    const inCollection = getDirname(f.path) === collection.route.replace(/^\//, '')
    return inCollection && isMarkdown(f.path)
  })

  const parsedFiles = []
  const contents = await Promise.all(
    collectionTree.map((f) => getFileContent(token, {
      file: f.path,
      repo: project.repo,
      branch: project.branch,
    }))
  )

  for (const f of collectionTree) {
    const fileContent = contents[collectionTree.indexOf(f)]

    if (!fileContent) {
      throw new Response(`Content for file "${f.path}" was not found in github API`, {
        status: 404,
        statusText: 'Not found'
      })
    }

    const collectionFile = processFileContent(fileContent)
    parsedFiles.push({
      ...collectionFile,
      // removing body for collection files to reduce payload size
      body: includeBody ? collectionFile.body : '',
    })
  }

  parsedFiles.sort((a, b) => a.attributes.order - b.attributes.order)

  return parsedFiles as CollectionFile[]
}

type UpdateOrderParams = {
  repo: string
  branch: string
  collectionRoute: string
  files: CollectionFile[]
}

export async function updateCollectionFileOrder(token: string, payload: UpdateOrderParams) {
  const { repo, branch, collectionRoute, files } = payload
  
  const fullFiles = await getCollectionFiles(
    token,
    { repo, branch, id: 0, title: '', user: '' },
    { route: collectionRoute, name: '', id: '', template: '' },
    true
  )

  const contents = [] as string[]
  for (const file of files) {
    if (!file.attributes.order) {
      file.attributes.order = files.indexOf(file)
    }
    const matter = Object.entries(file.attributes)
      .map(([key, value]) => `${key}: ${key === 'order' ? files.indexOf(file) : value}`)
      .join('\n')

    const fullFile = fullFiles.find((f) => f.path === file.path)

    await deleteFileCache(repo, branch, file.path)
    const content = ['---', matter, '---', '', fullFile?.body || ''].join('\n')
    contents.push(content)
  }

  const commit = await commitAndPush(token, {
    repo,
    branch,
    message: `Updated order for files in ${collectionRoute}`,
    files: files.map((f, i) => ({
      content: contents[i],
      path: f.path,
      mode: FileMode.FILE,
      type: 'blob' as const
    }))
  })

  return commit
}

type SaveDraftParams = {
  project: Project
  file: CollectionFile
}

export async function saveDraft(params: SaveDraftParams) {
  return withRedis(async (db) => {
    const { project, file } = params
    const key = `draft:${project.id}:${encodeURIComponent(file.path)}`
    await db.sadd(`drafts:${project.repo}`, key)
    await db.set(key, JSON.stringify(file))
    return key
  })
}

export async function getDraftKeys(project: Project) {
  return withRedis(async (db) => {
    const keys = await db.smembers(`drafts:${project.repo}`)
    return (keys || [])
      .filter((k) => k.startsWith(`draft:${project.id}:`))
      .map((k) => decodeURIComponent(k.replace(`draft:${project.id}:`, '')))
  })
}

export async function getDraft(projectId: number, path: string) {
  return withRedis<CollectionFile>(async (db) => {
    const data = await db.get(`draft:${projectId}:${encodeURIComponent(path)}`)
    return data && JSON.parse(data)
  })
}

export async function deleteDraft(project: Project, path: string) {
  return withRedis(async (db) => {
    const key = `draft:${project.id}:${encodeURIComponent(path)}`
    await db.srem(`drafts:${project.repo}`, key)
    await db.del(key)
  })
}

export async function deleteAllDrafts(project: Project) {
  return withRedis(async (db) => {
    const draftKeys = await db.smembers(`drafts:${project.repo}`)
    console.log(draftKeys)
    return await db.del(`drafts:${project.repo}`, ...draftKeys)
  })
}

export async function renameDraft(project: Project, oldPath: string, newPath: string) {
  const draft = await getDraft(project.id, oldPath)
  if (!draft) {
    return
  }

  return withRedis(async (db) => {
    await Promise.all([
      db.set(`draft:${project.id}:${encodeURIComponent(newPath)}`, JSON.stringify(draft)),
      db.sadd(`drafts:${project.repo}`, `draft:${project.id}:${encodeURIComponent(newPath)}`),
      db.del(`draft:${project.id}:${encodeURIComponent(oldPath)}`),
      db.srem(`drafts:${project.repo}`, `draft:${project.id}:${encodeURIComponent(oldPath)}`),
    ])
  })
}
