import type { ProjectCollection } from "@/lib/projects.server"
import { buttonCN } from "@/lib/styles"
import { PlusIcon } from "@heroicons/react/20/solid"
import { Link, useMatches } from "@remix-run/react"

const PARENT_ROUTE_ID = "routes/projects/$org.$repo"

export default function Collections() {
  const match = useMatches().find(r => r.id === PARENT_ROUTE_ID)
  const collections = match?.data.config.collections as ProjectCollection[]
  
  return (
    <div className="p-4 text-slate-700">
      <h2 className="font-medium text-4xl mb-2">Content</h2>
      {collections.length === 0 && (
        <p className="dark:text-stone-200">
          You don't have any saved content collection.
        </p>
      )}
      <Link to='config' className="mt-8 inline-block">
        <button className={`${buttonCN.normal} ${buttonCN.slate} ${buttonCN.iconLeft}`}>
          <PlusIcon className='w-6 h-6' />
          <p>Create collection</p>
        </button>
      </Link>
    </div>
  )
}
