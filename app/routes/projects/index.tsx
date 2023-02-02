import metaTitle from "@/lib/metaTitle"
import type { Project } from "@/lib/projects.server"
import { getUserProjects } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN } from "@/lib/styles"
import { PlusIcon } from "@heroicons/react/20/solid"
import { CodeBracketSquareIcon } from "@heroicons/react/24/outline"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

type LoaderData = {
  projects: Project[]
}

export const meta = {
  title: metaTitle('Projects')
}

export async function loader({ request }: LoaderArgs) {
  const { user } = await requireUserSession(request)
  const projects = await getUserProjects(user.name)
  return json<LoaderData>({ projects })
}

export default function ProjectsList() {
  const { projects } = useLoaderData<LoaderData>()
  const listCN = 'py-2 px-2 rounded-md text-lg bg-slate-100 dark:bg-slate-700'
  
  return (
    <div className="px-3 py-8">
      <h2 className="font-medium text-4xl mb-4">Projects</h2>
      {projects.length === 0 && (
        <p className="dark:text-stone-200">
          You don't have any project saved yet
        </p>
      )}
      <ul className="mb-8 space-y-4">
        {projects.map((p) => (
          <li key={p.id} className={listCN}>
            <Link className="text-xl pb-1 flex items-center gap-3" to={`/p/${p.id}`}>
              <CodeBracketSquareIcon className="w-7 h-7 text-slate-400" />
              <div>
                <p>{p.title}</p>
                <p>
                  <span className="dark:text-slate-300 text-slate-500">{p.repo.split('/')[0]}</span>
                  <span> / </span>
                  <span className="font-medium">{p.repo.split('/')[1]}</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link to='/projects/new' className="inline-block">
        <button className={`${buttonCN.normal} ${buttonCN.slate} ${buttonCN.iconLeft}`}>
          <PlusIcon className='w-6 h-6' />
          <p>New project</p>
        </button>
      </Link>
      <footer className="-mx-2 mt-6 flex items-center gap-2 text-sm">
        <Link className="p-2 hover:underline" to='/doc'>Documentation</Link>
        <div className="h-6 border-r border-slate-300"></div>
        <Link className="p-2 hover:underline" to='/privacy'>Privacy</Link>
      </footer>
    </div>
  )  
}
