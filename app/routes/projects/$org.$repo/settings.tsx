import { deleteProject } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN, checkboxCN, inputCN, labelCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { PlusIcon } from "@heroicons/react/20/solid"
import { ActionFunction, redirect } from "@remix-run/node"
import { Form, Link, Outlet, useTransition } from "@remix-run/react"

const groupCN = 'py-2'
const listCN = [
  'flex items-center pl-4 p-2 rounded-md text-lg',
  'bg-slate-100 dark:bg-slate-700'
].join(' ')

export default function ProjectSettings() {
  const config = useProjectConfig()

  return (
    <div className="p-4 space-y-8">
      <h2 className="font-medium text-4xl my-4">Settings</h2>
      <Outlet />
      <div>
        <header className="flex items-center justify-between mb-1">
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
        <header className="flex items-center justify-between mb-1">
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
          <ul className="space-y-4">
            {config.templates.map((t) => (
              <li key={t.id} className={listCN}>
                <Link to={`templates/${t.id}`} className="flex-grow">{t.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <DangerZone />
    </div>
  )
}

export const action: ActionFunction = async ({ request, params }) => {
  const { user } = await requireUserSession(request)
  const repo = `${params.org}/${params.repo}`
  const formData = await request.formData()
  const op = formData.get('operation')

  if (op === 'delete') {
    await deleteProject(user.name, repo)
  }

  return redirect('/')
}

function DangerZone() {
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  function handleSubmit(ev: React.MouseEvent) {
    if (!window.confirm('¿Are you sure you want to delete this project?')) {
      ev.preventDefault()
    }
  }

  return (
    <div className="pt-12">
      <h3 className="font-medium text-xl mb-1">Danger zone</h3>
      <Form method="post" className="mt-4">
        <button
          name="operation"
          value="delete"
          type="submit"
          disabled={busy}
          onClick={handleSubmit}
          className={`${buttonCN.big} bg-red-600 hover:bg-red-700 text-white`}>
          Delete Project
        </button>
      </Form>
      </div>
  )
}
