import { buttonCN, checkboxCN, inputCN, labelCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { PencilIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/20/solid"
import { Link, Outlet, useFetcher } from "@remix-run/react"

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
        <h3 className="mb-1 font-medium text-xl border-b-2 border-gray-200 dark:border-gray-600">Collections</h3>
        <div className={groupCN}>
          {config.collections.length === 0 && (
            <p>You don't have any saved collection.</p>
          )}
          <ul className="space-y-4 mt-4">
            {config.collections.map((c) => (
              <li key={c.id} className={listCN}>
                <Link to={`collections/${c.id}`} className="flex-grow">{c.name}</Link>
              </li>
            ))}
          </ul>
          <Link to='collections/new'>
            <button className={`mt-4 ${buttonCN.slate} ${buttonCN.normal}`}>New collection</button>
          </Link>
        </div>
      </div>
      <div>
        <h3 className="mb-1 font-medium text-xl border-b-2 border-gray-200 dark:border-gray-600">Templates</h3>
        <div className={groupCN}>
          {config.templates.length === 0 && (
            <p>You don't have any saved template.</p>
          )}
          <Link to='templates/new'>
            <button className={`mt-4 ${buttonCN.slate} ${buttonCN.normal}`}>New template</button>
          </Link>
        </div>
      </div>
      <DraftsForm />
    </div>
  )
}

function CollectionForm() {
  return (
    <form className="md:flex space-y-4 items-end gap-3 py-3">
      <div>
        <label htmlFor="name" className={labelCN}>Name</label>
        <input name="name" type="text" className={inputCN} />
      </div>
      <div>
        <label htmlFor="route" className={labelCN}>Route</label>
        <input name="route" type="text" className={inputCN} />
      </div>
      <button className={`${buttonCN.slate} ${buttonCN.normal}`}>New collection</button>
    </form>
  )
}

function TemplateForm() {
  return (
    <form className="md:flex space-y-4 items-end gap-3 py-3">
      <div>
        <label htmlFor="name" className={labelCN}>Name</label>
        <input name="name" type="text" className={inputCN} />
      </div>
      <button className={`${buttonCN.slate} ${buttonCN.normal}`}>New template</button>
    </form>
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
