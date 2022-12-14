import metaTitle from "@/lib/metaTitle"
import type { Project } from "@/lib/projects.server"
import { getUserProjects } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN } from "@/lib/styles"
import { PlusIcon } from "@heroicons/react/20/solid"
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
  const listCN = 'py-2 px-4 rounded-md text-lg bg-slate-100 dark:bg-slate-700'
  
  return (
    <div className="px-3 py-8">
      <h2 className="font-medium text-4xl mb-4">Projects</h2>
      {projects.length === 0 && (
        <p className="dark:text-stone-200">
          You don't have any project saved yet
        </p>
      )}
      <ul className="mb-4 space-y-4">
        {projects.map((p) => (
          <li key={p.repo} className={listCN}>
            <Link className="block text-xl pb-1" to={p.repo}>{p.title}</Link>
            <p className="">
              <span className="">{p.repo.split('/')[0]}</span>
              {' / '}
              <span className="dark:text-slate-300 text-slate-500">{p.repo.split('/')[1]}</span>
            </p>
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
