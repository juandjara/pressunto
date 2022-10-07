import { Redis } from "@upstash/redis"

const db = Redis.fromEnv()

export type RedisRepo = {
  title: string
  repo: string
  branch: string
}

export async function getUserRepos(user: string) {
  const keys = await db.keys(`${user}:*`)
  if (keys.length === 0) {
    return []
  }

  const data = await Promise.all(keys.map((k) => db.hgetall(k).then(data => ({ ...data, repo: k.split(':')[1] }))))
  return data as RedisRepo[]
}

export async function setUserRepo(user: string, repo: RedisRepo) {
  return await db.hset(`${user}:${repo.repo}`, { branch: repo.branch, title: repo.title })
}
