import { b64EncodeUnicode, parseGithubFile } from './fileUtils'

const OAUTH_URL = 'https://github.com/login/oauth'
export const API_URL = 'https://api.github.com'
const ACCEPT_HEADER = 'application/vnd.github+json'

type fetchURL = Parameters<typeof fetch>[0]
type fetchOptions = Parameters<typeof fetch>[1]

export async function callGithubAPI(token: string, url: fetchURL, options?: fetchOptions) {
  const fullUrl = typeof url === 'string' ? API_URL + url : url
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': ACCEPT_HEADER,
      'Authorization': `Bearer ${token}`,
      ...options?.headers
    }
  })

  if (!res.ok) {
    throw res
  }

  const data = await res.json()
  return { data, headers: res.headers }
}

type GetAccessTokenParams = {
  code: string
  clientID: string
  clientSecret: string
}

export async function getAccessToken({ code, clientID, clientSecret }: GetAccessTokenParams) {
  const url = `${OAUTH_URL}/access_token`
  const body = {
    client_id: clientID,
    client_secret: clientSecret,
    code
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  try {
    if (!res.ok) {
      const text = await res.text()
      throw new Response(text, { status: 500 })
    }

    const data = await res.json()
    if (data?.error) {
      throw new Response(JSON.stringify(data), { status: 500 })
    }

    return data
  } catch (err) {
    if (err instanceof Response) {
      throw err
    } else {
      throw new Response(`Can't process token response: ${err}`, { status: 500 })
    }
  }
}

export type User = {
  avatar: string
  name: string
}

export async function getCurrentUser(token: string) {
  const { data } = await callGithubAPI(token, `/user`)
  return {
    avatar: data.avatar_url,
    name: data.login
  } as User
}

type Org = {
  login: string
  id: number
  node_id: string
  url: string
  repos_url: string
  events_url: string
  hooks_url: string
  issues_url: string
  members_url: string
  public_members_url: string
  avatar_url: string
  description: string
}

export async function getOrgs(token: string) {
  const { data } = await callGithubAPI(token, `/user/orgs`) as { data: Org[] }
  return data.map((o) => o.login)
}

export type Permissions = {
  admin: boolean
  push: boolean
  pull: boolean
}

export async function getRepoDetails(token: string, repo: string) {
  const { data } = await callGithubAPI(token, `/repos/${repo}`)
  return {
    default_branch: data.default_branch as string,
    permissions: data.permissions as Permissions
  }
}

export type TreeItem = {
  mode: FileMode
  path: string
  sha: string
  type: 'tree' | 'blob'
  url?: string
}

type TreeResponse = {
  sha: string
  url: string
  tree: TreeItem[]
  truncated: boolean
}

export async function getRepoFiles(token: string, repo: string, branch?: string) {
  if (!branch) {
    const details = await getRepoDetails(token, repo)
    branch = details.default_branch
  }
  
  const { data: repoDetails } = await callGithubAPI(token, `/repos/${repo}/git/refs/heads/${branch}`)

  const treeSha = repoDetails.object.sha
  const res = await callGithubAPI(token, `/repos/${repo}/git/trees/${treeSha}?recursive=true`)
  const data = res.data as TreeResponse


  data.tree.sort((a, b) => {
    if (a.type === 'blob' && b.type === 'tree') return 1
    else if (a.type === 'tree' && b.type === 'blob') return -1
    else return a.path < b.path ? -1 : 1
  })

  return data.tree
}

export type ParsedFile = ReturnType<typeof parseGithubFile>

type GetContentParams = {
  repo: string
  file: string
  isNew?: boolean
  branch?: string
}

export async function getFileContent(token: string, { repo, file, isNew = false, branch }: GetContentParams) {
  if (isNew) {
    return null
  }

  if (!branch) {
    const details = await getRepoDetails(token, repo)
    branch = details.default_branch
  }

  const fileURL = `/repos/${repo}/contents/${file}?ref=${branch}`
  const { data } = await callGithubAPI(token, fileURL)

  /*
    if encoding is none,
    it means it is too big to be returned inside the json response
    so we need to fetch it as raw text
  */
  if (data.encoding === 'none') {
    const res = await fetch(API_URL + fileURL, {
      headers: new Headers({
        'Accept': 'application/vnd.github.v3.raw',
        'Authorization': `Bearer ${token}`,
      })
    })
    data.content = await res.text()
  }

  return parseGithubFile(data)
}

export type SaveFileParams = {
  repo: string
  message: string
  branch?: string
  path: string
  sha?: string
  content: string
}

export async function saveFile(token: string, params: SaveFileParams) {
  const { repo, message, branch, sha, path, content } = params

  const url = `/repos/${repo}/contents/${encodeURIComponent(path)}`
  const body = { message, sha, branch, content: b64EncodeUnicode(content) }

  const { data } = await callGithubAPI(token, url, { method: 'PUT', body: JSON.stringify(body) })
  return data
}

export enum FileMode {
  FILE = '100644',
  EXECUTABLE = '100755',
  SYMLINK = '120000',
  TREE = '040000',
  SUBMODULE = '160000'
}

type GitTreeItem = {
  path: string
  mode: FileMode
  type: 'blob' | 'tree' | 'commit'
} & ({ sha: string | null } | { content: string })

type TreeCreatePayload = {
  base_tree: string
  tree: GitTreeItem[]
}

export async function createTree(token: string, repo: string, tree: TreeCreatePayload) {
  const url = `/repos/${repo}/git/trees`
  const { data } = await callGithubAPI(token, url, { method: 'POST', body: JSON.stringify(tree) })
  return data
}

type BranchReference = {
  ref: string
  node_id: string
  url: string
  object: {
    sha: string
    type: string
    url: string
  }
}

export async function getBranch(token: string, repo: string, branch: string) {
  const url = `/repos/${repo}/git/refs/heads/${branch || 'master'}`
  const { data } = await callGithubAPI(token, url) as { data: BranchReference }
  return data
}

type BranchListItem = {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
  protection: {
    required_status_checks: {
      enforcement_level: string
      contexts: string[]
    }
  }
  protection_url: string
}

export async function getBranches(token: string, repo: string) {
  const { data } = await callGithubAPI(token, `/repos/${repo}/branches`) as { data: BranchListItem[] }
  return data
}

type CommitFilesParams = {
  repo: string
  branch: string
  message: string
  files: GitTreeItem[]
}

export async function commitAndPush(token: string, params: CommitFilesParams) {
  const { repo, branch, message, files } = params
  const branchData = await getBranch(token, repo, branch)
  const baseSha = branchData.object.sha
  const tree = await createTree(token, repo, {
    base_tree: baseSha,
    tree: files
  })

  const { data: commitData } = await callGithubAPI(token, `/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [baseSha]  
    })
  })

  await callGithubAPI(token, `/repos/${repo}/git/refs/heads/${branch}`, {
    method: 'PUT',
    body: JSON.stringify({ sha: commitData.sha })
  })

  return commitData
}

type RenameParams = {
  repo: string
  branch: string
  sha: string
  path: string
  newPath: string
  message: string
}

export async function renameFile(token: string, params: RenameParams) {
  const { repo, branch, sha, path, newPath, message } = params
  const commit = await commitAndPush(token, {
    repo,
    branch,
    message,
    files: [
      {
        path,
        mode: FileMode.FILE,
        type: 'blob',
        sha: null,
      },
      {
        path: newPath,
        mode: FileMode.FILE,
        type: 'blob',
        sha,
      },
    ]
  })
  return commit
}

type DeleteFileParams = {
  repo: string
  branch: string
  path: string
  message: string
}

export async function deleteFile(token: string, params: DeleteFileParams) {
  const { repo, branch, path, message } = params
  const commit = await commitAndPush(token, {
    repo,
    branch,
    message,
    files: [
      {
        path,
        mode: FileMode.FILE,
        type: 'blob',
        sha: null,
      }
    ]
  })
  return commit
}
