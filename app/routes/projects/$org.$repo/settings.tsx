import { buttonCN, checkboxCN, inputCN, labelCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { PlusIcon } from "@heroicons/react/20/solid"
import { Link, Outlet } from "@remix-run/react"

const groupCN = 'py-2'
const listCN = [
  'flex items-center pl-4 p-2 rounded-md text-lg',
  'bg-slate-100 dark:bg-slate-700'
].join(' ')

export default function ProjectSettings() {
  const config = useProjectConfig()

  return (
    <div className="p-4 space-y-8">
      <h2 className="font-medium text-4xl">Settings</h2>
      <Outlet />
      <div>
        <header className="flex items-center justify-between mb-1 border-gray-200 dark:border-gray-600">
          <h3 className="font-medium text-xl">Collections</h3>
          <Link to='collections/new'>
            <button
              type="button"
              title="Create new collection"
              aria-label="Create new collection"
              className="flex items-center gap-2 ml-2 pl-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-100/25">
              <span>New</span>
              <PlusIcon className="w-6 h-6" />
            </button>
          </Link>
        </header>
        <div className={groupCN}>
          {config.collections.length === 0 && (
            <p>You don't have any saved collection.</p>
          )}
          <ul className="space-y-4">
            {config.collections.map((c) => (
              <li key={c.id} className={listCN}>
                <Link to={`collections/${c.id}`} className="flex-grow">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <header className="flex items-center justify-between mb-1 border-gray-200 dark:border-gray-600">
          <h3 className="font-medium text-xl">Templates</h3>
          <Link to='templates/new'>
            <button
              type="button"
              title="Create new template"
              aria-label="Create new template"
              className="flex items-center gap-2 ml-2 pl-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-100/25">
              <span>New</span>
              <PlusIcon className="w-6 h-6" />
            </button>
          </Link>
        </header>
        <div className={groupCN}>
          {config.templates.length === 0 && (
            <p>You don't have any saved template.</p>
          )}
        </div>
      </div>
      {/* <DraftsForm /> */}
    </div>
  )
}

function DraftsForm() {
  return (
    <div>
      <h3 className="font-medium text-xl mb-1 border-b-2 border-gray-200 dark:border-gray-600">Drafts</h3>
      <div className={`${groupCN} space-y-4`}>
        <label className="dark:text-slate-300 text-slate-600 inline-flex items-center">
          <input
            name="enabled"
            type="checkbox"
            className={`mr-2 ${checkboxCN}`}
          />
          Enabled
        </label>
        <div>
          <label className={labelCN} htmlFor="route">Route</label>
          <input required name='route' type='text' className={inputCN} />
        </div>
      </div>
    </div>
  )
}
