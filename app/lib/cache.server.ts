import type { ParsedFile, TreeItem } from "./github"
import { withRedis } from "./redis.server"

const ONE_DAY = 60 * 60 * 24

export async function getCachedFiles(repo: string, branch: string) {
  return withRedis<string[]>(async (db) => {
    const data = await db.smembers(`caches:${repo}`)
    return (data || [])
      .filter((key) => key.startsWith(`file:${repo}/${branch}/`))
      .map((key) => key.replace(`file:${repo}/${branch}/`, ""))
  })
}

export async function deleteAllCaches(repo: string) {
  return withRedis(async (db) => {
    const cacheKeys = await db.smembers(`caches:${repo}`)
    return await db.del(`caches:${repo}`, ...cacheKeys)
  })
}

export async function getTreeCache(repo: string, sha: string) {
  return withRedis<TreeItem[]>(async (db) => {
    const data = await db.get(`tree:${repo}:${sha}`)
    return data && JSON.parse(data)
  })
}

export async function setTreeCache(repo: string, sha: string, tree: TreeItem[]) {
  const key = `tree:${repo}:${sha}`
  return withRedis(async (db) => {
    await db.pipeline()
      .sadd(`caches:${repo}`, key)
      .expire(`caches:${repo}`, ONE_DAY)
      .setex(key, ONE_DAY, JSON.stringify(tree))
      .exec()
  })
}

export async function deleteTreeCache(repo: string, sha: string) {
  const key = `tree:${repo}:${sha}`
  return withRedis(async (db) => {
    await db.pipeline()
      .srem(`caches:${repo}`, key)
      .del(key)
      .exec()
  })
}

export async function getFileCache(repo: string, branch: string, path: string) {
  return withRedis<ParsedFile>(async (db) => {
    const data = await db.get(`file:${repo}/${branch}/${path}`)
    return data && JSON.parse(data)
  })
}

export async function setFileCache(repo: string, branch: string, path: string, file: ParsedFile) {
  const key = `file:${repo}/${branch}/${path}`
  return withRedis(async (db) => {
    await db.pipeline()
      .sadd(`caches:${repo}`, key)
      .expire(`caches:${repo}`, ONE_DAY)
      .setex(key, ONE_DAY, JSON.stringify(file))
      .exec()
  })
}

export async function deleteFileCache(repo: string, branch: string, path: string) {
  const key = `file:${repo}/${branch}/${path}`
  return withRedis(async (db) => {
    await db.pipeline()
      .srem(`caches:${repo}`, key)
      .del(key)
      .exec()
  })
}
