import { Redis } from "@upstash/redis"
import { getFileContent, getRepoFiles, saveFile } from "./github"

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

  return JSON.parse(file?.content || CONFIG_FILE_TEMPLATE)
}

