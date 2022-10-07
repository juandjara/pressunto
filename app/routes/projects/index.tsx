import type { RedisRepo } from "@/lib/redis.server"
import { getUserRepos } from "@/lib/redis.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN } from "@/lib/styles"
import { PlusIcon } from "@heroicons/react/20/solid"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"

type LoaderData = {
  repos: RedisRepo[]
}

export async function loader({ request }: LoaderArgs) {
  const { user } = await requireUserSession(request)
  const repos = await getUserRepos(user.name)
  return json<LoaderData>({ repos })
}

export default function ProjectsList() {
  const { repos } = useLoaderData<LoaderData>()
  const listCN = 'py-2 px-4 -mx-4 mb-2 rounded-md text-lg bg-slate-100 dark:bg-slate-700'
  
  return (
    <div className="px-3 py-8">
      <h2 className="font-medium text-4xl mb-6">Projects</h2>
      {repos.length === 0 && (
        <p className="dark:text-stone-200">
          You don't have any project saved yet
        </p>
      )}
      <ul className="mb-8">
        {repos.map((r) => (
          <li key={r.repo} className={listCN}>
            <Link className="block text-xl pb-1" to={`/p/${r.repo}`}>{r.title}</Link>
            <p className="dark:text-slate-300 text-slate-600">
              <span className="">{r.repo.split('/')[0]}</span>
              {' / '}
              <span className="">{r.repo.split('/')[1]}</span>
            </p>
          </li>
        ))}
      </ul>
      <Link to='/projects/new'>
        <button className={`${buttonCN.normal} ${buttonCN.slate} flex items-center gap-2 pl-2`}>
          <PlusIcon className='w-6 h-6' />
          <p>Create project</p>
        </button>
      </Link>
    </div>
  )  
}
