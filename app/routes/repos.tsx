import { getOrgs, searchRepos } from "@/lib/github"
import type { RepoData } from '@/lib/github'
import { requireUserSession } from "@/lib/session.server"
import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Form, Link, useLoaderData, useSearchParams, useTransition } from "@remix-run/react"
import useCurrentUser from "@/lib/useCurrentUser"
import { getRecentRepos } from "@/lib/recentsCookie.server"
import { checkboxCN, inputCN } from '@/lib/styles'
import Spinner from "@/components/Spinner"

type LoaderData = {
  orgs: string[]
  org: string | null
  repos: RepoData
  recentRepos: string[]
}

export async function loader({ request }: LoaderArgs) {
  const { token, user } = await requireUserSession(request)
  const params = new URL(request.url).searchParams
  const page = Number(params.get('page') || 1)
  const org = params.get('org') as string
  const [orgs, repos, recentRepos] = await Promise.all([
    getOrgs(token),
    searchRepos(token, {
      org: org || '',
      user: org ? '' : user.name,
      includeForks: params.get('includeForks') === 'on',
      query: params.get('q') as string,
      page
    }),
    getRecentRepos(request)
  ])

  return json<LoaderData>({
    org: org || user.name,
    orgs,
    repos,
    recentRepos
  }, {
    headers: {
      'Vary': 'Cookie',
      'Cache-control': 'max-age=60'
    }
  })
}

export default function RepoSearch() {
  const user = useCurrentUser()
  const { orgs, repos, recentRepos } = useLoaderData<LoaderData>()
  const [params, setSearchParams] = useSearchParams()
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  function navigatePage(page: number) {
    const p = Object.fromEntries(params.entries())
    setSearchParams({ ...p, page: String(page) })
  }

  return (
    <div>
      <div className="py-2 px-3 my-4">
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">Repositorios recientes</p>
        <ul className="flex flex-wrap justify-start items-center">
          {recentRepos.map((r) => (
            <li className="mr-4 mb-2 py-1 px-3 font-medium rounded-xl border border-slate-400" key={r}>
              <Link to={`/r/${r}`}>{r}</Link>
            </li>
          ))}
        </ul>
      </div>
      <Form>
        <fieldset disabled={busy} className="mt-4 flex flex-wrap items-center justify-between pl-4">
          <label className="mr-4 mb-2 dark:text-slate-300 text-slate-600 inline-flex items-center">
            <input
              name="includeForks"
              type="checkbox"
              className={`mr-2 ${checkboxCN}`}
              defaultChecked={params.get('includeForks') === 'on'}
            />
            Include Forks
          </label>
          <div className="mb-2 mr-4">
            <select
              name="org"
              className={inputCN}
              disabled={busy}
              defaultValue={params.get('org') || undefined}>
              <option value="">{user.name}</option>
              {orgs.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex-grow mb-2 mr-4 relative">
            <input
              type="search"
              name="q"
              placeholder="Search repo"
              onFocus={ev => ev.target.select()}
              disabled={busy}
              className={`${inputCN} pr-10`}
              defaultValue={params.get('q') || undefined}
            />
            <button
              disabled={busy}
              type="submit"
              style={{ top: 3, right: 3 }}
              className="absolute p-2 disabled:pointer-events-none hover:bg-slate-100 hover:bg-opacity-50 rounded-r-md">
              {busy ? (
                <Spinner />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              )}
            </button>
          </div>
        </fieldset>
      </Form>
      <ul className="px-2 mt-2">
        {repos?.items.map((r: any) => (
          <li key={r.full_name} className="p-4 rounded-md dark:hover:bg-slate-100/25 hover:bg-slate-100">
            <Link to={`/r/${r.full_name}?branch=${r.default_branch}`} className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-slate-500 dark:text-slate-400 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <div className="ml-3">
                <p className="text-slate-700 dark:text-slate-200 font-bold">{r.name}</p>
                <p className="text-slate-600 dark:text-slate-300">{r.description}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{r.language}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <footer className="mb-4 p-4 flex items-center justify-between">
        {repos.page_data.prev ? (
          <button className="flex items-center space-x-2 rounded-md text-slate-600 px-4 py-2 hover:bg-slate-100" onClick={() => navigatePage(repos.page_data.prev!)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
            </svg>
            <span>Previous</span>
          </button>
        ) : <div></div>}
        {repos.page_data.next ? (
          <button className="flex items-center space-x-2 rounded-md text-slate-600 px-4 py-2 hover:bg-slate-100" onClick={() => navigatePage(repos.page_data.next!)}>
            <span>Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </button>
        ) : null}
      </footer>
    </div>
  )
}
