import { buttonCN, iconCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { PlusIcon, Cog6ToothIcon, DocumentDuplicateIcon } from "@heroicons/react/20/solid"
import { Link, useParams } from "@remix-run/react"

const listCN = 'group flex items-center gap-2 p-2 pr-1 rounded-md bg-slate-100 dark:bg-slate-700'

export default function Collections() {
  const { collections } = useProjectConfig()
  const { project } = useParams()
  const backLink = `/p/${project}`

  return (
    <div className="p-4">
      <h2 className="font-medium text-4xl text-slate-500 dark:text-slate-300 my-2 flex items-center gap-2">
        <p>Collections</p>
      </h2>
      {collections.length === 0 && (
        <p className="dark:text-stone-200">
          You don't have any saved collection.
        </p>
      )}
      <ul className="space-y-4 mt-4">
        {collections.map((c) => (
          <li key={c.id} className={listCN}>
            <DocumentDuplicateIcon className={iconCN.big} />
            <Link to={c.id} className="text-slate-600 dark:text-slate-200 text-xl flex-grow">{c.name}</Link>
            <Link to={`settings/collections/${c.id}?back=${backLink}`} className='opacity-0 group-hover:opacity-100 transition-opacity'>
              <button title="Edit collection" className="ml-2 p-2 rounded-lg dark:hover:bg-slate-500 hover:bg-slate-200">
                <Cog6ToothIcon className={iconCN.big} />
              </button>
            </Link>
          </li>
        ))}
      </ul>
      <Link to='settings/collections/new' className="mt-8 inline-block">
        <button className={`${buttonCN.normal} ${buttonCN.slate} ${buttonCN.iconLeft}`}>
          <PlusIcon className='w-5 h-5' />
          <p>Create collection</p>
        </button>
      </Link>
    </div>
  )
}
