import Modal from "@/components/Modal"
import type { Project, ProjectConfig} from "@/lib/projects.server"
import { updateConfigFile } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import slugify from "@/lib/slugify"
import { buttonCN, inputCN, labelCN } from "@/lib/styles"
import useProjectConfig, { useProject } from "@/lib/useProjectConfig"
import type { ActionFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, useNavigate, useParams, useTransition } from "@remix-run/react"

export const action: ActionFunction = async ({ request, params }) => {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()

  const name = formData.get('name') as string
  const route = formData.get('route') as string
  const template = (formData.get('template') || '') as string
  const config = JSON.parse((formData.get('config') || '') as string) as ProjectConfig
  const project = JSON.parse((formData.get('project') || '') as string) as Project
  const operation = formData.get('operation') as string
  let id = slugify(name)

  if (id === 'index') id = '_index'
  if (id === 'settings') id = '_settings'
  if (id === 'site') id = '_site'

  const foundCollection = config.collections.find((c) => c.id === params.cid)
  if (foundCollection) {
    if (operation === 'delete') {
      config.collections = config.collections.filter((c) => c.id !== params.cid)
    } else {
      Object.assign(foundCollection, { name, route, template })
    }
  } else {
    config.collections.push({
      id,
      name,
      route,
      template
    })
  }

  await updateConfigFile(token, project, config)

  return redirect(`/projects/${params.org}/${params.repo}/settings`, {
    headers: new Headers({
      'cache-control': 'no-cache'
    })
  })
}

export default function EditCollection() {
  const navigate = useNavigate()
  const { cid: collectionId } = useParams()
  const config = useProjectConfig()
  const collection = config.collections.find((c) => c.id === collectionId)
  const project = useProject()
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  function closeModal() {
    navigate('..')
  }
  
  function handleSubmit(ev: React.MouseEvent) {
    const isDelete = (ev.target as HTMLButtonElement).value === 'delete'
    if (isDelete && !window.confirm('¿Are you sure you want to delete this collection?')) {
      ev.preventDefault()
    }
  }

  return (
    <Modal open onClose={closeModal} title={collection ? 'Edit Collection' : 'New Collection'}>
      <Form replace method="post">
        <fieldset disabled={busy} className="space-y-4">
          <input name="config" type="hidden" value={JSON.stringify(config)} />
          <input name="project" type="hidden" value={JSON.stringify(project)} />
          <div>
            <label htmlFor="name" className={labelCN}>Name</label>
            <input
              required
              name="name"
              type="text"
              className={inputCN}
              defaultValue={collection?.name}
            />
          </div>
          <div>
            <label htmlFor="route" className={labelCN}>Route</label>
            <input
              required
              name="route"
              type="text"
              className={inputCN}
              defaultValue={collection?.route}
            />
          </div>
          <div>
            <label htmlFor="template" className={labelCN}>Template</label>
            <input
              name="template"
              type="text"
              className={inputCN}
              defaultValue={collection?.template}
            />
          </div>
        </fieldset>
        <div className="flex items-center mt-4">
          <button
            type="submit"
            name="operation"
            value="update"
            disabled={busy}
            className={`${buttonCN.slate} ${buttonCN.normal}`}>
            {busy ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={closeModal}
            className={`${buttonCN.normal} ml-3 hover:bg-slate-100 dark:hover:bg-slate-100/25`}>
            Cancel
          </button>
          <div className="flex-grow"></div>
          {collection && (
            <button
              type="submit"
              name="operation"
              value="delete"
              disabled={busy}
              onClick={handleSubmit}
              className={`${buttonCN.normal} text-red-700 hover:bg-red-50`}>
              Delete
            </button>
          )}
        </div>
      </Form>
    </Modal>
  )
}
