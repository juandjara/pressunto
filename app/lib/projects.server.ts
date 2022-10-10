import { Redis } from "@upstash/redis"

const db = Redis.fromEnv()

export type Project = {
  title: string
  repo: string
  branch: string
}

export type Collection = {
  id: string
  name: string
  route: string
  template: string
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
  return await db.get(`project:${user}:${repo}`) as Project[]
}

export async function saveProject(user: string, project: Omit<Project, 'id'>) {
  return Promise.all([
    db.sadd(`user:${user}:projects`, project.repo),
    db.set(`project:${user}:${project.repo}`, project)
  ])
}
