import { Redis } from "@upstash/redis"
import { createBlob, getFileContent, getRepoFiles, ParsedFile, pushFolder, saveFile } from "./github"
import { getDirname, isMarkdown } from "./pathUtils"
import matter from 'front-matter'

const db = Redis.fromEnv()

export type Project = {
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

type FieldConfig = {
  name: string
  field: string
  default: string
  hidden: boolean
}

export type ProjectConfig = {
  collections: ProjectCollection[]
  templates: ProjectTemplates[]
  drafts: {
    enabled: boolean
    route: string
  }
}

export async function getUserProjects(user: string) {
  const keys = await db.smembers(`user:${user}:projects`)
  if (keys.length === 0) {
    return []
  }

  const projects = await db.mget(...keys.map(k => `project:${user}:${k}`))
  return projects as Project[]
}

export async function getProject(user: string, repo: string) {
  return await db.get(`project:${user}:${repo}`) as Project
}

export async function saveProject(user: string, project: Project) {
  return Promise.all([
    db.sadd(`user:${user}:projects`, project.repo),
    db.set(`project:${user}:${project.repo}`, project)
  ])
}

export const CONFIG_FILE_NAME = 'pressunto.config.json'
export const CONFIG_FILE_TEMPLATE = `{
  "collections": [],
  "templates": [],
  "drafts": {
    "enabled": false,
    "route": "/drafts"
  }
}
`

export async function createConfigFile(token: string, project: Project) {
  const repoTree = await getRepoFiles(token, project.repo)
  const configFile = repoTree.find((f) => f.path === CONFIG_FILE_NAME)
  if (configFile) {
    return
  }

  await saveFile(token, {
    method: 'PUT',
    repo: project.repo,
    branch: project.branch,
    name: CONFIG_FILE_NAME,
    content: CONFIG_FILE_TEMPLATE,
    message: 'Create config file for Pressunto',
    path: '',
  })
}

export async function updateConfigFile(token: string, project: Project, config: ProjectConfig) {
  const file = await getFileContent(token, {
    file: CONFIG_FILE_NAME,
    repo: project.repo,
    branch: project.branch
  })
  await saveFile(token, {
    method: 'PUT',
    sha: file?.sha,
    repo: project.repo,
    branch: project.branch || 'master',
    name: CONFIG_FILE_NAME,
    content: JSON.stringify(config),
    message: 'Update config file for Pressunto',
    path: '',
  })
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
  name: string
  title: string
  path: string
  attributes: Record<string, any>
  body: string
}

export function processFileContent(fileContent: ParsedFile) {
  const data = matter<{ title: string; order: number }>(fileContent.content)
  const title = data.attributes.title || fileContent.name
  return {
    id: fileContent.sha,
    name: fileContent.name,
    title,
    path: fileContent.path,
    attributes: data.attributes,
    body: data.body
  }
}

export async function getCollectionFiles(token: string, project: Project, collection: ProjectCollection) {
  const tree = await getRepoFiles(token, project.repo, project.branch || 'master')
  const collectionTree = tree.filter((f) => {
    const inCollection = getDirname(f.path) === collection.route.replace(/^\//, '')
    return inCollection && isMarkdown(f.path)
  })

  const parsedFiles = []
  const contents = await Promise.all(
    collectionTree.map((f) => getFileContent(token, {
      repo: project.repo,
      branch: project.branch,
      file: f.path
    }))
  )

  for (const f of collectionTree) {
    const fileContent = contents[collectionTree.indexOf(f)]

    if (!fileContent) {
      throw new Response(`File ${f.path} not found in github content API`, {
        status: 404,
        statusText: 'Not found'
      })
    }

    parsedFiles.push(processFileContent(fileContent))
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
  
  const contents = []
  for (const file of files) {
    const matter = Object.entries(file.attributes)
      .map(([key, value]) => `${key}: ${key === 'order' ? files.indexOf(file) : value}`)
      .join('\n')

    const content = ['---', matter, '---', '', file.body].join('\n')
    contents.push(content)
  }

  const newBlobIds = await Promise.all(
    contents.map((c) => createBlob(token, repo, c).then(blob => blob.sha))
  )

  const blobs = files.map((f, i) => ({
    sha: newBlobIds[i],
    path: f.path,
    mode: '100644',
    type: 'blob'
  }))

  const commit = await pushFolder(token, repo, branch, {
    message: `Updated order for files in ${collectionRoute}`,
    files: blobs
  })

  return commit
}
