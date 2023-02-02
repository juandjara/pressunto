import { ComboBoxLocal } from "@/components/ComboBoxLocal"
import Modal from "@/components/Modal"
import type { TreeItem } from "@/lib/github"
import { getRepoFiles } from "@/lib/github"
import type { Project, ProjectConfig, ProjectTemplates} from "@/lib/projects.server"
import { getProject} from "@/lib/projects.server"
import { updateConfigFile } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import slugify from "@/lib/slugify"
import { buttonCN, inputCN, labelCN } from "@/lib/styles"
import useProjectConfig, { useProject } from "@/lib/useProjectConfig"
import type { ActionFunction, LoaderFunction} from "@remix-run/node"
import { json} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, useLoaderData, useNavigate, useParams, useTransition } from "@remix-run/react"

export const action: ActionFunction = async ({ request, params }) => {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()

  const name = formData.get('name') as string
  let route = formData.get('route') as string

  if (!name) {
    throw new Response('Parameter "name" is mandatory', { status: 400, statusText: 'Bad Request' })
  }
  if (!route) {
    throw new Response('Parameter "route" is mandatory', { status: 400, statusText: 'Bad Request' })
  }

  if (!route.startsWith('/')) {
    route = '/' + route
  }

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

  return redirect(`/p/${project.id}/settings`, {
    headers: new Headers({
      'cache-control': 'no-cache',
      'Set-Cookie': await setFlashMessage(request, 'Project settings updated')
    })
  })
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const tree = await getRepoFiles(token, project.repo, project.branch)
  return json({ tree: tree.filter((t) => t.type === 'tree') })
}

export default function EditCollection() {
  const navigate = useNavigate()
  const { cid: collectionId } = useParams()
  const config = useProjectConfig()
  const collection = config.collections.find((c) => c.id === collectionId)
  const project = useProject()
  const transition = useTransition()
  const busy = transition.state === 'submitting'
  const { tree } = useLoaderData<{ tree: TreeItem[] }>()
  const templateOptions = [{ id: '', name: 'No template', fields: [] as any }].concat(config.templates)

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
            <label htmlFor="route" className={labelCN}>Folder</label>
            <ComboBoxLocal<TreeItem>
              name='route'
              options={tree}
              labelKey='path'
              valueKey='path'
              defaultValue={collection?.route.replace(/^\//, '')}
            />
          </div>
          <div>
            <label htmlFor="template" className={labelCN}>Template</label>
            <ComboBoxLocal<ProjectTemplates>
              name='template'
              options={templateOptions}
              labelKey='name'
              valueKey='id'
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
