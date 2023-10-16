import type { ParsedFile, TreeItem } from "./github"
import { withRedis } from "./redis.server"

export async function getTreeCache(repo: string, sha: string) {
  return withRedis<TreeItem[]>(async (db) => {
    const data = await db.get(`tree:${repo}:${sha}`)
    return data && JSON.parse(data)
  })
}

export async function setTreeCache(repo: string, sha: string, tree: TreeItem[]) {
  return withRedis(async (db) => {
    const oneDay = 60 * 60 * 24
    await db.setex(`tree:${repo}:${sha}`, oneDay, JSON.stringify(tree))
  })
}

export async function deleteTreeCache(repo: string, sha: string) {
  return withRedis(async (db) => {
    await db.del(`tree:${repo}:${sha}`)
  })
}

export async function getFileCache(repo: string, branch: string, path: string) {
  return withRedis<ParsedFile>(async (db) => {
    const data = await db.get(`file:${repo}/${branch}/${path}`)
    return data && JSON.parse(data)
  })
}

export async function setFileCache(repo: string, branch: string, path: string, file: ParsedFile) {
  return withRedis(async (db) => {
    const oneDay = 60 * 60 * 24
    await db.setex(`file:${repo}/${branch}/${path}`, oneDay, JSON.stringify(file))
  })
}

export async function deleteFileCache(repo: string, branch: string, path: string) {
  return withRedis(async (db) => {
    await db.del(`file:${repo}/${branch}/${path}`)
  })
}
