import Modal from "@/components/Modal"
import type { Project, ProjectConfig, ProjectTemplates} from "@/lib/projects.server"
import { updateConfigFile } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import slugify from "@/lib/slugify"
import { buttonCN, checkboxCN, inputCN, labelCN } from "@/lib/styles"
import useProjectConfig, { useProject } from "@/lib/useProjectConfig"
import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid"
import type { ActionFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, useNavigate, useParams, useTransition } from "@remix-run/react"
import { useState } from "react"

export const action: ActionFunction = async ({ request, params }) => {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()

  const project = JSON.parse((formData.get('project') || '') as string) as Project
  const config = JSON.parse((formData.get('config') || '') as string) as ProjectConfig

  const name = formData.get('name') as string

  const field_keys = JSON.parse(formData.get('field_keys') as string) as string[]
  const fields = field_keys.map((f) => ({
    field: f,
    hidden: formData.get(`field__${f}__hidden`) === 'on',
    default: formData.get(`field__${f}__default`) as string,
    name: formData.get(`field__${f}__name`) as string
  })) as ProjectTemplates['fields']

  const operation = formData.get('operation') as string

  let id = slugify(name)

  const foundTemplate = config.templates.find((t) => t.id === params.tid)
  if (foundTemplate) {
    if (operation === 'delete') {
      config.templates = config.templates.filter((t) => t.id !== params.tid)
    } else {
      Object.assign(foundTemplate, { id, name, fields })
    }
  } else {
    config.templates.push({
      id,
      name,
      fields
    })
  }

  await updateConfigFile(token, project, config)

  return redirect(`/projects/${params.org}/${params.repo}/settings`, {
    headers: new Headers({
      'cache-control': 'no-cache'
    })
  })
}

export default function EditTemplate() {
  const navigate = useNavigate()
  const project = useProject()
  const config = useProjectConfig()
  const { tid: templateId } = useParams()
  const template = config.templates.find((t) => t.id === templateId)
  const [fields, setFields] = useState(template?.fields || [])
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  function closeModal() {
    navigate('..')
  }

  function addField() {
    const key = window.prompt('Enter new field')
    if (key) {
      setFields(f => f.concat({ field: key, hidden: false, name: '', default: '' }))
    }
  }

  function removeField(key: string) {
    setFields(f => f.filter(f => f.field !== key))
  }

  function handleSubmit(ev: React.MouseEvent) {
    const isDelete = (ev.target as HTMLButtonElement).value === 'delete'
    if (isDelete && !window.confirm('¿Are you sure you want to delete this template?')) {
      ev.preventDefault()
    }
  }

  return (
    <Modal open onClose={closeModal} title="New Template">
      <Form replace method="post" className="space-y-4">
        <input name="config" type="hidden" value={JSON.stringify(config)} />
        <input name="project" type="hidden" value={JSON.stringify(project)} />  
        <div>
          <label htmlFor="name" className={labelCN}>Name</label>
          <input required name="name" type="text" className={inputCN} defaultValue={template?.name} />
        </div>
        <div>
          <input type='hidden' name='field_keys' value={JSON.stringify(fields.map((f) => f.field))} />
          <label className={labelCN}>Fields</label>
          <ul className="space-y-2">
            {fields.map((f) => (
              <li key={f.field} className="p-2 bg-slate-200/50 dark:bg-slate-600 rounded-md">
                <details>
                  <summary className="pl-1">
                    <div style={{ width: 'calc(100% - 16px)' }} className="pl-1 inline-flex items-center justify-between">
                      <p>{f.field}</p>
                      <button
                        type='button'
                        onClick={() => removeField(f.field)}
                        className={`${buttonCN.cancel} ${buttonCN.small} px-1`}>
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </summary>
                  <div className="space-y-4 mt-4">
                    <label className="dark:text-slate-300 text-slate-600 inline-flex items-center">
                      <input
                        name={`field__${f.field}__hidden`}
                        type="checkbox"
                        className={`mr-2 ${checkboxCN}`}
                        defaultChecked={f.hidden}
                      />
                      Hidden
                    </label>
                    <div>
                      <label htmlFor={`field__${f.field}__name`} className={labelCN}>Label</label>
                      <input type='text' className={inputCN} name={`${f.field}__name`} defaultValue={f.name} />
                    </div>
                    <div>
                      <label htmlFor={`field__${f.field}__default`} className={labelCN}>Default</label>
                      <input type='text' className={inputCN} name={`${f.field}__default`} defaultValue={f.default} />
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={addField}
            className={`mt-2 pr-3 ${buttonCN.small} ${buttonCN.slate} ${buttonCN.iconLeft}`}>
            <PlusIcon className="w-5 h-5" />
            <span>Add field</span>
          </button>
        </div>
        <div className="pt-4 flex items-center">
          <button
            type="submit"
            name="operation"
            value="update"
            disabled={busy || fields.length === 0}
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
          {template && (
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
