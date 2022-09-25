import parseLink from 'parse-link-header'

const OAUTH_URL = 'https://github.com/login/oauth'
const API_URL = 'https://api.github.com'
const ACCEPT_HEADER = 'application/vnd.github+json'

type fetchURL = Parameters<typeof fetch>[0]
type fetchOptions = Parameters<typeof fetch>[1]

async function callGithubAPI(token: string, url: fetchURL, options?: fetchOptions) {
  const res = await fetch(url, {
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
  const { data } = await callGithubAPI(token, `${API_URL}/token`)
  return {
    avatar: data.avatar_url,
    name: data.login
  } as User
}

export async function getOrgs(token: string) {
  const { data } = await callGithubAPI(token, `${API_URL}/user/orgs`)
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

  const fullUrl = url.toString() + `&q=${q}`
  const { data, headers } = await callGithubAPI(token, fullUrl)

  // console.log(data.items[0])

  data.items = data.items.map((r: any) => ({
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
