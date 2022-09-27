import FileTree from "@/components/FileTree"
import { getFileContent, getRepoDetails, getRepoFiles } from "@/lib/github"
import type { ParsedFile, TreeItem } from '@/lib/github'
import { requireUserSession } from "@/lib/session.server"
import type { LoaderArgs } from "@remix-run/node"
import { Link, useLoaderData, useSearchParams } from "@remix-run/react"
import clsx from 'clsx'
import FileDetails from "@/components/FileDetails"
import FileLabel from "@/components/FileLabel"

type LoaderData = {
  org: string
  repo: string
  files: TreeItem[]
  content: ParsedFile
  permissions: {
    admin: boolean
    push: boolean
    pull: boolean
  }
}

export async function loader({ request, params }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const fullRepo = params['*'] || ''
  const [org, repo] = fullRepo.split('/')
  const sp = new URL(request.url).searchParams
  const file = sp.get('file')
  const isNew = sp.get('new') === 'true'

  const [files, details, content] = await Promise.all([
    getRepoFiles(token, fullRepo),
    getRepoDetails(token, fullRepo),
    file ? getFileContent(token, { repo: fullRepo, isNew, file }) : null
  ])

  return { org, repo, files, content, permissions: details.permissions }
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
  const { files, org, repo, content } = useLoaderData<LoaderData>()
  const [searchParams] = useSearchParams()
  const file = searchParams.get('file')
  const sidebarCN = clsx('max-w-xs w-full flex-shrink-0 mr-2', { 'hidden md:block': !!file })

  return (
    <div className="py-4">
      <main className="flex items-stretch">
        <aside className={sidebarCN}>
          {file ? (
            <div className="hidden md:block mb-4 pl-2">
              <FileLabel file={file} />
            </div>
          ) : null}
          <FileTree tree={files} />
        </aside>
        {file ? <FileDetails repo={`${org}/${repo}`} file={content} /> : null}
      </main>
    </div>
  )
}
