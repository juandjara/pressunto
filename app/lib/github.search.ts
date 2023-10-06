import parseLink from 'parse-link-header'
import type { Permissions} from "./github"
import { API_URL, callGithubAPI } from "./github"

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

export type RepoSearchResults = {
  page_data: {
    next?: number
    prev?: number
    last?: number
    first?: number
  }
  total_count: number
  items: RepoItem[]
}

type searchRepoParams = {
  user?: string
  org?: string
  query?: string
  includeForks?: boolean
  page?: number
  rpp?: number
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

  data.items = (data.items as (RepoItem & { permissions: Permissions })[])
    .filter((r) => r.permissions.push) // keep only repos you have write access to
    .map((r) => ({ // keep only relevant fields
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
  } as RepoSearchResults
}
