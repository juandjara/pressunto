import Modal from "@/components/Modal"
import SortableItem from "@/components/SortableItem"
import type { FieldConfig, Project, ProjectConfig, ProjectTemplates} from "@/lib/projects.server"
import { updateConfigFile } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import slugify from "@/lib/slugify"
import { buttonCN, checkboxCN, inputCN, labelCN } from "@/lib/styles"
import useProjectConfig, { useProject } from "@/lib/useProjectConfig"
import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ArrowsUpDownIcon, Bars2Icon, PencilIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid"
import type { ActionFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, useNavigate, useParams, useTransition } from "@remix-run/react"
import { useState } from "react"
import { createPortal } from "react-dom"

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
      'cache-control': 'no-cache',
      'Set-Cookie': await setFlashMessage(request, 'Project settings updated')
    })
  })
}

enum LIST_MODE {
  EDIT = 'EDIT',
  REORDER = 'REORDER'
}

export default function EditTemplate() {
  const navigate = useNavigate()
  const project = useProject()
  const config = useProjectConfig()
  const { tid: templateId } = useParams()
  const template = config.templates.find((t) => t.id === templateId)
  const [fields, setFields] = useState(template?.fields || [])
  const [mode, setMode] = useState<LIST_MODE>(LIST_MODE.EDIT)
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  function closeModal() {
    navigate('..')
  }

  function handleSubmit(ev: React.MouseEvent) {
    const isDelete = (ev.target as HTMLButtonElement).value === 'delete'
    if (isDelete && !window.confirm('¿Are you sure you want to delete this template?')) {
      ev.preventDefault()
    }
  }

  return (
    <Modal open onClose={closeModal} title="New Template">
      <Form replace method="post" className="relative">
        <input name="config" type="hidden" value={JSON.stringify(config)} />
        <input name="project" type="hidden" value={JSON.stringify(project)} />  
        <input name='field_keys' type='hidden' value={JSON.stringify(fields.map((f) => f.field))} />
        <div className="mb-8">
          <label htmlFor="name" className={labelCN}>Name</label>
          <input required name="name" type="text" className={inputCN} defaultValue={template?.name} />
        </div>
        <div>
          <div className="flex items-end justify-between gap-2 flex-nowrap mb-2 mr-2">
            <label className={labelCN}>Fields</label>
            {mode === LIST_MODE.EDIT ? (
              <button
                title="Switch to reorder mode"
                type="button"
                className={`${buttonCN.cancel} ${buttonCN.small} pl-1 pr-1`}
                onClick={() => setMode(LIST_MODE.REORDER)}>
                <ArrowsUpDownIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                title="Switch to edit mode"
                type="button"
                className={`${buttonCN.cancel} ${buttonCN.small} pl-1 pr-1`}
                onClick={() => setMode(LIST_MODE.EDIT)}>
                <PencilIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          {mode === LIST_MODE.EDIT ? (
            <FieldEdit
              fields={fields}
              setFields={setFields}
            />
          ) : (
            <FieldReorder
              fields={fields}
              setFields={setFields}
            />
          )}
        </div>
        <div className="mt-8 flex items-center">
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

type FieldListProps = {
  fields: FieldConfig[]
  setFields: React.Dispatch<React.SetStateAction<FieldConfig[]>>
}

function FieldReorder({ fields, setFields }: FieldListProps) {
  const [activeId, setActiveId] = useState(null)
  const activeItem = fields.find(f => f.field === activeId)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(ev: any) {
    setActiveId(ev.active.id)
  }

  function handleDragEnd(ev: any) {
    if (ev.active.id !== ev.over.id) {
      const oldIndex = fields.findIndex(f => f.field === ev.active.id)
      const newIndex = fields.findIndex(f => f.field === ev.over.id)
      const newFields = arrayMove(fields, oldIndex, newIndex)
      setFields(newFields)
    }

    setActiveId(null)
  }

  return (
    <div>
      <ul className="space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={fields.map((f) => ({ ...f, id: f.field }))} strategy={verticalListSortingStrategy}>
            {fields.map((f) => (
              <SortableItem key={f.field} id={f.field} isActive={activeId === f.field}>
                <div className="flex items-center gap-1 cursor-move h-11 p-2 bg-slate-200/50 dark:bg-slate-600 rounded-md">
                  <Bars2Icon className="h-6 w-4" />
                  <p>{f.field}</p>
                </div>
              </SortableItem>
            ))}
          </SortableContext>
          {createPortal(
            <DragOverlay>
              {
                activeItem
                  ? (
                    <div className="shadow-md flex items-center gap-1 cursor-move h-11 p-2 bg-slate-200/50 dark:bg-slate-600 rounded-md">
                      <Bars2Icon className="h-6 w-4" />
                      <p>{activeItem.field}</p>
                    </div>
                  )
                  : null
              }
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </ul>
    </div>
  )
}

function FieldEdit({ fields, setFields }: FieldListProps) {
  function addField() {
    const key = window.prompt('Enter new field')
    if (key) {
      setFields(f => f.concat({ field: key, hidden: false, name: '', default: '' }))
    }
  }

  function removeField(key: string) {
    setFields(f => f.filter(f => f.field !== key))
  }

  return (
    <div>
      <ul className="space-y-2">
        {fields.map((f) => (
          <li key={f.field} className="p-2 bg-slate-200/50 dark:bg-slate-600 rounded-md">
            <details>
              <summary className="pl-1 cursor-pointer">
                <div style={{ width: 'calc(100% - 16px)' }} className="pl-1 inline-flex items-center justify-between">
                  <p>{f.field}</p>
                  <button
                    type='button'
                    onClick={() => removeField(f.field)}
                    className={`${buttonCN.cancel} ${buttonCN.small} pr-1 pl-1`}>
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </summary>
              <div className="space-y-4 mt-4">
                <label className="flex items-center">
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
                  <input
                    type='text'
                    className={inputCN}
                    name={`field__${f.field}__name`}
                    defaultValue={f.name}
                    placeholder={f.field}
                  />
                </div>
                <div>
                  <label htmlFor={`field__${f.field}__default`} className={labelCN}>Default</label>
                  <input type='text' className={inputCN} name={`field__${f.field}__default`} defaultValue={f.default} />
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
  )
}
