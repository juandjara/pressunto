import parseLink from 'parse-link-header'
import * as mime from 'mime'
import isbinary from 'is-binary-path'
import { isMarkdown } from './pathUtils'

const OAUTH_URL = 'https://github.com/login/oauth'
const API_URL = 'https://api.github.com'
const ACCEPT_HEADER = 'application/vnd.github+json'

type fetchURL = Parameters<typeof fetch>[0]
type fetchOptions = Parameters<typeof fetch>[1]

async function callGithubAPI(token: string, url: fetchURL, options?: fetchOptions) {
  const fullUrl = typeof url === 'string' ? API_URL + url : url
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
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

type getAccessTokenParams = {
  code: string
  clientID: string
  clientSecret: string
}

export async function getAccessToken({ code, clientID, clientSecret }: getAccessTokenParams) {
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
    const data = await res.json()
    if (data?.error || !res.ok) {
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

export async function getOrgs(token: string) {
  const { data } = await callGithubAPI(token, `/user/orgs`)
  return data.map((o: any) => o.login) as string[]
}

type searchRepoParams = {
  user?: string
  org?: string
  query?: string
  includeForks?: boolean
  page?: number
  rpp?: number
}

export type RepoItem = {
  name: string
  full_name: string
  description: string
  language: string
  default_branch: string
  pushed_at: string
  fork: boolean
  private: boolean
}

export type RepoData = {
  page_data: {
    next?: number
    prev?: number
    last?: number
    first?: number
  }
  total_count: number
  items: RepoItem[]
}

export async function searchRepos(token: string, {
  user = '',
  org = '',
  query = '',
  includeForks = false,
  page = 1,
  rpp = 10
}: searchRepoParams) {
  const url = new URL(`${API_URL}/search/repositories`)
  url.searchParams.set('per_page', String(rpp))
  url.searchParams.set('page', String(page))

  let q = query || ''
  if (user) {
    q = `${q}+user:${user}`
  }
  if (org) {
    q = `${q}+org:${org}`
  }
  if (includeForks) {
    q = `${q}+fork:true`
  }

  const fullUrl = new URL(url.toString() + `&q=${q}`)
  const { data, headers } = await callGithubAPI(token, fullUrl)

  data.items = data.items
    .filter((r: any) => r.permissions.push) // keep only permissions you have write access to
    .map((r: any) => ({ // keep only relevant data
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      language: r.language,
      default_branch: r.default_branch,
      pushed_at: r.pushed_at,
      fork: r.fork,
      private: r.private
    }))

  const pageData = parseLink(headers.get('link'))

  return {
    page_data: {
      next: pageData?.next?.page,
      prev: pageData?.prev?.page,
      last: pageData?.last?.page,
      first: pageData?.first?.page
    },
    total_count: data.total_count,
    items: data.items
  } as RepoData
}

export async function getRepoDetails(token: string, repo: string) {
  const { data } = await callGithubAPI(token, `/repos/${repo}`)
  return {
    default_branch: data.default_branch,
    permissions: data.permissions
  }
}

export async function getRepoBranches(token: string, repo: string, selectedBranch?: string) {
  const { data } = await callGithubAPI(token, `/repos/${repo}/branches?per_page=100`)
  const branches = data.map((b: any) => b.name) as string[]
  return selectedBranch ? Array.from(new Set([selectedBranch, ...branches])) : branches
}

export async function getRepoFiles(token: string, repo: string, branch?: string) {
  if (!branch) {
    const details = await getRepoDetails(token, repo)
    branch = details.default_branch
  }
  
  const { data: repoDetails } = await callGithubAPI(token, `/repos/${repo}/git/refs/heads/${branch}`)

  const treeSha = repoDetails.object.sha
  const { data: files } = await callGithubAPI(token, `/repos/${repo}/git/trees/${treeSha}?recursive=true`)

  files.tree.sort((a: any, b: any) => {
    if (a.type === 'blob' && b.type === 'tree') return 1
    else if (a.type === 'tree' && b.type === 'blob') return -1
    else return a.path < b.path ? -1 : 1
  })

  return files.tree as TreeItem[]
}

export type TreeItem = {
  mode: string
  path: string
  sha: string
  type: 'tree' | 'blob'
  url: string
}

type File = {
  content: string
  size: number
  type: string
  sha: string
  name: string
  path: string
  download_url: string
  html_url: string
  encoding: 'base64' | 'none'
}

export type ParsedFile = ReturnType<typeof parseFile>

type FileRequest = {
  repo: string
  file: string
  isNew?: boolean
  branch?: string
}

export async function getFileContent(token: string, { repo, file, isNew = false, branch }: FileRequest) {
  if (isNew) {
    return null
  }

  if (!branch) {
    const details = await getRepoDetails(token, repo)
    branch = details.default_branch
  }

  // console.log({ token, url: `${API_URL}/repos/${repo}/contents/${file}?ref=${branch}` })
  const fileURL = `/repos/${repo}/contents/${file}?ref=${branch}`
  const { data } = await callGithubAPI(token, fileURL)
  if (data.encoding === 'none') {
    const res = await fetch(API_URL + fileURL, {
      headers: new Headers({
        'Accept': 'application/vnd.github.v3.raw',
        'Authorization': `Bearer ${token}`,
      })
    })
    data.content = await res.text()
  }

  return parseFile(data)
}

export function parseFile(file: File) {
  const extension = getExtension(file.name)
  const lang = extensionToCodeMirrorLang(extension || '')
  const mimeType = mime.getType(file.name)
  const format = mimeType?.split('/')[0] || ''
  const isBinary = isbinary(file.name)

  let content = file.content
  if (!isBinary && file.encoding === 'base64') {
    content = b64DecodeUnicode(file.content)
  }

  return {
    ...file,
    lang,
    format,
    mimeType,
    isBinary,
    isMarkdown: isMarkdown(file.name),
    content
  }
}

// from here: https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
function b64DecodeUnicode(str: string) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}

function b64EncodeUnicode(str: string) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
          return String.fromCharCode(Number('0x' + p1))
  }))
}

function extensionToCodeMirrorLang(extension: string) {
  if (isMarkdown(extension)) return 'gfm'
  if (['js', 'json'].indexOf(extension) !== -1) return 'javascript'
  if (extension === 'html') return 'htmlmixed'
  if (extension === 'rb') return 'ruby'
  if (/(yml|yaml)/.test(extension)) return 'yaml'
  if (['java', 'c', 'cpp', 'cs', 'php'].indexOf(extension) !== -1) return 'clike'

  return extension
}

function getExtension(path: string) {
  const match = path.match(/\.(\w+)$/)
  return match ? match[1] : null
}

export type CommitParams = {
  repo: string
  message: string
  branch?: string
  path: string
  sha?: string
  content: string
  method: 'PUT' | 'DELETE'
  name: string
}

export async function saveFile(token: string, params: CommitParams) {
  const { method, repo, message, branch, sha, path, name, content } = params

  const url = `/repos/${repo}/contents/${path}${name}`
  const body = { message, sha, branch, content: b64EncodeUnicode(content) }
  const { data } = await callGithubAPI(token, url, { method, body: JSON.stringify(body) })
  return data
}

export async function createBlob(token: string, repo: string, content: string) {
  const body = {
    encoding: 'base64',
    content: b64EncodeUnicode(content)
  }

  const url = `/repos/${repo}/git/blobs`
  const { data } = await callGithubAPI(token, url, { method: 'POST', body: JSON.stringify(body) })

  return data
}

type TreeCreatePayload = {
  base_tree: string
  tree: Array<{
    sha: string
    path: string
    mode: string
    type: string
  }>
}

export async function createTree(token: string, repo: string, tree: TreeCreatePayload) {
  const url = `/repos/${repo}/git/trees`
  const { data } = await callGithubAPI(token, url, { method: 'POST', body: JSON.stringify(tree) })
  return data
}

export async function getBranch(token: string, repo: string, branch: string) {
  const { data } = await callGithubAPI(token, `/repos/${repo}/git/refs/heads/${branch || 'master'}`)
  return data
}

type PushFilesPayload = {
  message: string
  files: Array<{
    sha: string
    path: string
    mode: string
    type: string
  }>
}

export async function pushFolder(token: string, repo: string, branch: string, payload: PushFilesPayload) {
  const branchData = await getBranch(token, repo, branch)
  const tree = await createTree(token, repo, {
    base_tree: branchData.object.sha,
    tree: payload.files
  })

  const commitBody = {
    message: payload.message,
    tree: tree.sha,
    parents: [branchData.object.sha]
  }

  const { data: commitData } = await callGithubAPI(token, `/repos/${repo}/git/commits`, { method: 'POST', body: JSON.stringify(commitBody) })
  
  await callGithubAPI(token, `/repos/${repo}/git/refs/heads/${branch || 'master'}`, {
    method: 'PUT',
    body: JSON.stringify({ sha: commitData.sha })
  })

  return commitData
}
