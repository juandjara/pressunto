import { buttonCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { Cog6ToothIcon, PencilIcon, TrashIcon } from "@heroicons/react/20/solid"
import { Link } from "@remix-run/react"

const listCN = 'flex items-center pl-4 p-2 rounded-md text-lg bg-slate-100 dark:bg-slate-700'

export default function Collections() {
  const { collections } = useProjectConfig()

  return (
    <div className="p-4">
      <h2 className="font-medium text-4xl mb-2">Content</h2>
      {collections.length === 0 && (
        <>        
          <p className="dark:text-stone-200">
            You don't have any saved collection.
          </p>
          <Link to='settings' className="mt-8 inline-block">
            <button className={`${buttonCN.normal} ${buttonCN.slate} ${buttonCN.iconLeft}`}>
              <Cog6ToothIcon className='w-6 h-6' />
              <p>Go to settings</p>
            </button>
          </Link>
        </>
      )}
      <ul className="space-y-4 mt-4">
        {collections.map((c) => (
          <li key={c.id} className={listCN}>
            <Link to={c.id} className="flex-grow">{c.name}</Link>
            <Link to={`settings/collections/${c.id}`}>
              <button title="Edit collection" className="ml-2 p-2 rounded-lg dark:hover:bg-slate-500 hover:bg-slate-200">
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
