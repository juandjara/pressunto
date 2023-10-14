import { Redis } from "@upstash/redis"
import type { TreeItem } from "./github"

const db = Redis.fromEnv()

export async function getTreeCache(repo: string, sha: string) {
  return await db.get(`tree:${repo}:${sha}`) as TreeItem[]
}

export async function setTreeCache(repo: string, sha: string, tree: TreeItem[]) {
  await db.set(`tree:${repo}:${sha}`, tree, {
    ex: 60 * 60 * 24 // 1 day
  })
}
