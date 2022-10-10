import { Redis } from "@upstash/redis"

const db = Redis.fromEnv()

export type ProjectListItem = {
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

export async function getUserRepos(user: string) {
  const keys = await db.smembers(`${user}:repos`)
  if (keys.length === 0) {
    return []
  }

  const repos = await db.mget(...keys.map(k => `${user}:repos:${k}`))
  return repos as ProjectListItem[]
}

export async function setUserRepo(user: string, repo: ProjectListItem) {
  await db.sadd(`${user}:repos`, repo.repo)
  return await db.set(`${user}:repos:${repo.repo}`, repo)
}
