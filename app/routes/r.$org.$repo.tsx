import FileTree from "@/components/FileTree"
import { getRepoBranches, getRepoFiles } from "@/lib/github"
import type { TreeItem } from '@/lib/github'
import { requireUserSession } from "@/lib/session.server"
import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react"
import clsx from 'clsx'
import BranchSelect from "@/components/BranchSelect"

type LoaderData = {
  org: string
  repo: string
  branches: string[]
  files: TreeItem[]
  hasFile: boolean
}

export async function loader({ request, params }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const { org, repo, '*': path } = params
  if (!org || !repo) {
    throw new Response('Not found', { status: 404, statusText: 'Not foud' })
  }

  const fullRepo = `${org}/${repo}`
  const branch = new URL(request.url).searchParams.get('branch') || undefined
  const hasFile = !!path

  const [files, branches] = await Promise.all([
    getRepoFiles(token, fullRepo, branch),
    getRepoBranches(token, fullRepo)
  ])

  return json<LoaderData>({ org, repo, branches, files, hasFile }, {
    headers: {
      'Vary': 'Cookie',
      'Cache-control': 'max-age=60'
    }
  })
}

export const handle = {
  breadcrumb: (data: LoaderData) => (
    <span>
      <Link 
        to={`/repos?org=${data.org}`}
        className="text-slate-500 font-medium text-lg hover:underline">
        {data.org}
      </Link>
      {" "}<span className="text-slate-400 font-medium text-base">/ {data.repo}</span>
    </span>
  )
}

export default function RepoDetails() {
  const { files, hasFile, branches } = useLoaderData<LoaderData>()
  const sidebarCN = clsx('max-w-sm w-full flex-shrink-0 mr-2', { 'hidden md:block': hasFile })

  return (
    <div className="py-4">
      <main className="flex items-stretch">
        <aside className={sidebarCN}>
          <Form method="get">
            <div className="mb-5 mx-2">
              <label htmlFor="branch" className="text-xs text-slate-500 font-medium">Branch</label>
              <BranchSelect name='branch' options={branches} />
              <div className="hidden">
                <input type="submit" />
              </div>
            </div>
          </Form>
          <FileTree tree={files} />
        </aside>
        <Outlet />
      </main>
    </div>
  )
}
