import { createCookie } from "@remix-run/node"

export const repoCookies = createCookie("recent-repo", {
  sameSite: "lax",
  path: "/",
  httpOnly: true
})

export async function getRecentRepos(request: Request) {
  const cookieHeader = request.headers.get("Cookie")
  const repos = (await repoCookies.parse(cookieHeader)) || []
  return repos as string[]
}

export async function addRecentRepo(request: Request, repo: string) {
  const repos = await getRecentRepos(request)
  const newRepos = Array.from(new Set([repo, ...repos].slice(0, 5)))
  const cookie = await repoCookies.serialize(newRepos)
  return cookie
}
