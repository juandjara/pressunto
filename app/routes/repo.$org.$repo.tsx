import FileTree from "@/components/FileTree"
import { getRepoFiles } from "@/lib/github"
import type { TreeItem } from '@/lib/github'
import { requireUserSession } from "@/lib/session.server"
import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Link, Outlet, useLoaderData } from "@remix-run/react"
import clsx from 'clsx'

type LoaderData = {
  org: string
  repo: string
  files: TreeItem[]
  hasFile: boolean
}

export async function loader({ request, params }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const { org, repo } = params
  const fullRepo = `${org}/${repo}`
  const branch = new URL(request.url).searchParams.get('branch') || 'master'
  const hasFile = request.url.replace(`/repo/${fullRepo}`, '').length > 1

  const files = await getRepoFiles(token, fullRepo, branch)

  return json({ hasFile, files, org, repo }, {
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
  const { files, hasFile } = useLoaderData<LoaderData>()
  const sidebarCN = clsx('max-w-sm w-full flex-shrink-0 mr-2', { 'hidden md:block': hasFile })

  return (
    <div className="py-4">
      <main className="flex items-stretch">
        <aside className={sidebarCN}>
          <FileTree tree={files} />
        </aside>
        <Outlet />
      </main>
    </div>
  )
}
