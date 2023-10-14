import { Redis } from "@upstash/redis"
import type { ParsedFile, TreeItem } from "./github"

const db = Redis.fromEnv()

export async function getTreeCache(repo: string, sha: string) {
  return await db.get(`tree:${repo}:${sha}`) as TreeItem[]
}

export async function setTreeCache(repo: string, sha: string, tree: TreeItem[]) {
  await db.set(`tree:${repo}:${sha}`, tree, {
    ex: 60 * 60 * 24 // 1 day
  })
}

export async function deleteTreeCache(repo: string, sha: string) {
  await db.del(`tree:${repo}:${sha}`)
}

export async function getFileCache(repo: string, branch: string, path: string) {
  return await db.get(`file:${repo}/${branch}/${path}`) as ParsedFile
}

export async function setFileCache(repo: string, branch: string, path: string, file: ParsedFile) {
  await db.set(`file:${repo}/${branch}/${path}`, file, {
    ex: 60 * 60 * 24 // 1 day
  })
}

export async function deleteFileCache(repo: string, branch: string, path: string) {
  await db.del(`file:${repo}/${branch}/${path}`)
}
