import { getFileContent, getRepoDetails, saveFile } from "@/lib/github"
import type { CollectionFile, ProjectCollection } from "@/lib/projects.server"
import { processFileContent } from "@/lib/projects.server"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN, inputCN, labelCN } from "@/lib/styles"
import type { ActionArgs, LoaderFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useLoaderData, useParams, useTransition } from "@remix-run/react"
import { Tab } from '@headlessui/react'
import { useEffect, useState } from "react"
import MarkdownPreview from "@/components/MarkdownPreview"
import MarkdownEditor from "@/components/MarkdownEditor"
import useProjectConfig, { useProject } from "@/lib/useProjectConfig"
import { getBasename } from "@/lib/pathUtils"
import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid"
import slugify from "@/lib/slugify"

type LoaderData = {
  file: CollectionFile,
  collection: ProjectCollection
  permissions: {
    admin: boolean
    push: boolean
    pull: boolean
  }
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token, user } = await requireUserSession(request)
  const collectionId = params.cid
  const postFile = params.pid
  const repo = `${params.org}/${params.repo}`
  const project = await getProject(user.name, repo)
  const config = await getProjectConfig(token, project)
  const collection = config.collections.find((c) => c.id === collectionId)

  if (!collection) {
    throw new Response(`Collection ${collectionId} not found`, { status: 404, statusText: 'Not found' })
  }

  const folder = collection.route.replace(/^\//, '').replace(/\/$/, '')
  const isNew = postFile === 'new'

  const blankFile = {
    sha: '',
    name: '',
    path: folder,
    content: ''
  }

  const [file, details] = await Promise.all([
    isNew ? Promise.resolve(blankFile) : getFileContent(token, {
      repo,
      branch: project.branch,
      file: `${folder}/${postFile}`
    }),
    getRepoDetails(token, repo)
  ])

  return json<LoaderData>({
    collection,
    file: processFileContent(file || blankFile),
    permissions: details.permissions
  })
}

export async function action({ request, params }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()
  const op = formData.get('_op')
  const body = formData.get('markdown') as string
  const sha = formData.get('sha') as string
  const path = formData.get('path') as string
  const branch = formData.get('branch') as string || 'master'
  const repo = `${params.org}/${params.repo}`

  if (!body) {
    throw new Response(`"markdown" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }

  if (!path) {
    throw new Response(`"path" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }

  const meta_fields = formData.get('meta_fields') as string
  const matter = meta_fields
    .split(',')
    .map(key => `${key}: ${formData.get(`meta__${key}`)}`)
    .join('\n')

  const content = ['---', matter, '---', '', body].join('\n')

  const isNew = !sha

  const isDelete = op === 'delete'
  const slug = slugify(formData.get('meta__title') as string || '')
  const name = isNew ? `/${slug}.md` : ''
  const fullPath = path + name

  const message = op === 'delete' 
  ? `Delete file ${fullPath}` 
  : isNew
    ? `Create file ${fullPath}`
    : `Update file ${fullPath}`

  await saveFile(token, {
    branch,
    repo,
    sha,
    name: '',
    path: fullPath,
    message,
    method: isDelete ? 'DELETE' : 'PUT',
    content
  })

  const returnPath = isDelete ? '' : getBasename(fullPath)
  const redirectPath = `/projects/${repo}/${params.cid}/${returnPath}`

  return redirect(redirectPath)
}

function PostAttributes() {
  const { file } = useLoaderData<LoaderData>()

  const [attrs, setAttrs] = useState(() => {
    return Object.entries({
      ...file.attributes,
      title: file.attributes.title || ''
    }).map(e => ({
      field: e[0],
      value: e[1]
    }))
  })

  function removeField(key: string) {
    setAttrs(a => a.filter(f => f.field !== key))
  }

  function addField() {
    const key = window.prompt('Enter new field')
    if (key) {
      setAttrs(a => a.concat({ field: key, value: '' }))
    }
  }

  return (
    <fieldset className="space-y-6 mb-10">
      {attrs.map((entry) => (
        <div key={entry.field}>
          <div className={`${labelCN} flex items-center`}>
            <label htmlFor={entry.field} className="capitalize">{entry.field}</label>
            <div className="flex-grow"></div>
            <button
              type='button'
              onClick={() => removeField(entry.field)}
              className={`${buttonCN.iconLeft} ${buttonCN.small}`}>
              <XMarkIcon className="w-5 h-5" />
              <span>delete field</span>
            </button>
          </div>
          <input type='text' name={`meta__${entry.field}`} defaultValue={entry.value} className={inputCN} />
        </div>
      ))}
      <button
        type="button"
        onClick={addField}
        className={`${buttonCN.small} ${buttonCN.slate} ${buttonCN.iconLeft} pr-3`}>
        <PlusIcon className="w-5 h-5" />
        <span>New field</span>
      </button>
      <input type='hidden' name='meta_fields' value={attrs.map(f => f.field).join(',')} />
    </fieldset>
  )
}

function PostBody() {
  const { file } = useLoaderData<LoaderData>()
  const [tempContent, setTempContent] = useState('')

  useEffect(() => {
    if (file) {
      setTempContent(file.body || '')
    }
  }, [file])

  const tabButtonCN = ({ selected }: { selected: boolean }) => {
    const activeStyle = selected ? 
      `${buttonCN.cancel} border border-b-0 border-gray-300 dark:border-gray-500`
      : buttonCN.cancel

    return `${activeStyle} px-4 py-2 rounded-t-md font-medium`
  }

  return (
    <Tab.Group as="div" className='my-4'>
      <Tab.List className="mx-1.5 mb-2 mt-8 flex items-center gap-2">
        <Tab className={tabButtonCN}>Editor</Tab>
        <Tab className={tabButtonCN}>Preview</Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <MarkdownEditor
            name="markdown"
            initialValue={tempContent || file.body || ''}
            onChange={setTempContent}
          />
        </Tab.Panel>
        <Tab.Panel className='-mt-2'>
          <div className='p-3 rounded-md border border-gray-300'>
            <MarkdownPreview code={tempContent} />
          </div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  )
}

export default function PostEditor() {
  const { file, permissions } = useLoaderData<LoaderData>()
  const project = useProject()
  const { cid: collectionId } = useParams()
  const config = useProjectConfig()
  const collection = config.collections.find((c) => c.id === collectionId)
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  function handleSubmit(ev: React.MouseEvent) {
    const isDelete = (ev.target as HTMLButtonElement).value === 'delete'
    if (isDelete && !window.confirm('¿Are you sure you want to delete this collection?')) {
      ev.preventDefault()
    }
  }

  return (
    <Form method='post' className="py-4 px-2 md:px-4 mb-8">
      <PostAttributes />
      <PostBody />
      <input type='hidden' name='path' value={file.path} />
      <input type='hidden' name='branch' value={project.branch} />
      {permissions.push ? (
        <div className='flex items-center'>
          <button
            disabled={busy}
            type='submit'
            name='_op'
            value='save'
            className={`${buttonCN.normal} ${buttonCN.slate}`}>
            {busy ? 'Saving...' : 'Save'}
          </button>
          <Link to={`../${collection?.id}`}>
            <button
              type='button'
              className={`ml-2 ${buttonCN.normal} ${buttonCN.cancel}`}>
              Cancel
            </button>
          </Link>
          <div className='flex-grow'></div>
          <button
            disabled={busy}
            type='submit'
            name='_op'
            value='delete'
            onClick={handleSubmit}
            className='disabled:opacity-50 disabled:pointer-events-none py-2 px-4 rounded-md bg-red-50 text-red-700 hover:bg-red-100'>
            Delete
          </button>
          <input type="hidden" name="sha" value={file?.id} />
        </div>
      ) : (
        <div className="text-right text-red-800 rounded-xl p-3">
          <p className="text-lg">You don't have permission to push to this repo</p>
        </div>
      )}
    </Form>
  )
}
