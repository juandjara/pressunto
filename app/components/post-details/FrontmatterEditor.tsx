import type { CollectionFile, ProjectConfig } from "@/lib/projects.server"
import { buttonCN, inputCN, labelCN } from "@/lib/styles"
import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { Link, useLoaderData, useParams } from "@remix-run/react"
import { useState } from "react"

type LoaderData = {
  file: CollectionFile,
  config: ProjectConfig,
  permissions: {
    admin: boolean
    push: boolean
    pull: boolean
  }
}

export default function FrontmatterEditor({ onDraft }: { onDraft: () => void }) {
  const { cid, project } = useParams()
  const { config, file } = useLoaderData<LoaderData>()
  const collection = config.collections.find((c) => c.id === cid)
  const template = collection && config.templates.find((t) => t.id === collection.template)
  const backLink = `/p/${project}/${cid}/${file.name}`

  const [attrs, setAttrs] = useState(() => {
    const fields = template?.fields || []
    const fieldMap = Object.fromEntries(fields.map((f) => [f.field, f]))

    const keys = new Set([
      ...Object.keys(file.attributes),
      ...fields.map((f) => f.field)
    ])

    return Array.from(keys).map((key) => {
      const conf = fieldMap[key] || {
        field: key,
        name: '',
        hidden: false,
        default: '',
      }

      const value = file.attributes[key] || ''
      return {
        ...conf,
        value: typeof value === 'object' ? JSON.stringify(value) : value
      }
    })
  })

  function removeField(key: string) {
    setAttrs(a => a.filter(f => f.field !== key))
    onDraft()
  }

  function addField() {
    const key = window.prompt('Enter new field')
    if (key) {
      setAttrs(a => a.concat({
        field: key,
        name: key,
        hidden: false,
        default: '',
        value: '',
      }))
      onDraft()
    }
  }

  return (
    <div className="flex-grow flex-shrink-0">
      <div className="flex items-center mt-2">
        <p className="text-slate-600 dark:text-slate-200 text-sm font-semibold flex-grow">Fields</p>
        <button
          type="button"
          onClick={addField}
          className={`${buttonCN.small} ${buttonCN.slate} ${buttonCN.iconLeft} pr-3`}>
          <PlusIcon className="w-5 h-5" />
          <span>Add field</span>
        </button>
      </div>
      {attrs.length === 0 && (
        <p className="max-w-xs text-slate-500 dark:text-slate-300 text-sm font-medium mt-4">
          No fields defined for this collection.
          You can <Link className="underline" to={`/p/${project}/settings/templates/new?back=${backLink}`}>create a template</Link> to assign default fields to this collection.
        </p>
      )}
      <input type='hidden' name='meta_fields' value={attrs.map(f => f.field).join(',')} />
      <fieldset
        className="space-y-6 mb-10 mt-5"
        onBlur={(ev: React.FocusEvent<HTMLElement>) => {
          const isInput = ev.target.tagName.toLowerCase() === 'input'
          if (isInput) {
            onDraft()
          }
        }}
      >
        {attrs.map((entry) => (
          <div key={entry.field}>
            <div className={`${labelCN} ${entry.hidden ? 'hidden' : 'flex'} items-center`}>
              <label htmlFor={`meta__${entry.field}`} className="capitalize">{entry.name || entry.field}</label>
              <div className="flex-grow"></div>
              <button
                type='button'
                title="delete field"
                onClick={() => removeField(entry.field)}
                className={`p-1 rounded-md ${buttonCN.cancel}`}>
                <XMarkIcon className="w-5 h-5" />
                <span className="sr-only">delete field</span>
              </button>
            </div>
            <input
              type={entry.hidden ? 'hidden' : 'text'}
              name={`meta__${entry.field}`}
              defaultValue={entry.value || entry.default || ''}
              className={inputCN}
            />
          </div>
        ))}
      </fieldset>
    </div>
  )
}
