import { Redis } from "@upstash/redis"

const db = Redis.fromEnv()

export type RedisRepo = {
  title: string
  repo: string
  branch: string
}

export async function getUserRepos(user: string) {
  const keys = await db.smembers(`${user}:repos`)
  if (keys.length === 0) {
    return []
  }

  const repos = await db.mget(...keys.map(k => `${user}:repos:${k}`))
  return repos as RedisRepo[]
}

export async function setUserRepo(user: string, repo: RedisRepo) {
  await db.sadd(`${user}:repos`, repo.repo)
  return await db.set(`${user}:repos:${repo.repo}`, repo)
}
