import { getFileContent, getRepoDetails, saveFile } from "@/lib/github"
import type { CollectionFile, ProjectConfig } from "@/lib/projects.server"
import { processFileContent } from "@/lib/projects.server"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import { buttonCN, inputCN } from "@/lib/styles"
import type { ActionArgs, LoaderFunction, MetaFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData, useNavigate, useParams, useTransition } from "@remix-run/react"
import { useProject } from "@/lib/useProjectConfig"
import { getBasename } from "@/lib/pathUtils"
import slugify from "@/lib/slugify"
import FrontmatterEditor from "@/components/post-details/FrontmatterEditor"
import PostEditor from "@/components/post-details/PostEditor"
import metaTitle from "@/lib/metaTitle"
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid"
import { ArrowLeftIcon, ArrowUpTrayIcon, ArrowUturnLeftIcon, DocumentIcon, FolderOpenIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { Menu, Transition } from "@headlessui/react"

type LoaderData = {
  file: CollectionFile,
  config: ProjectConfig,
  permissions: {
    admin: boolean
    push: boolean
    pull: boolean
  }
}

export const meta: MetaFunction = ({ data }) => {
  return {
    title: metaTitle((data as LoaderData).file.title)
  }
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token } = await requireUserSession(request)
  const collectionId = params.cid
  const postFile = params.pid
  const project = await getProject(Number(params.project))
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
      repo: project.repo,
      branch: project.branch,
      file: `${folder}/${postFile}`
    }),
    getRepoDetails(token, project.repo)
  ])

  return json<LoaderData>({
    config,
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
  const branch = formData.get('branch') as string
  const repo = formData.get('repo') as string

  if (!body) {
    throw new Response(`"markdown" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }

  if (!path) {
    throw new Response(`"path" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }

  const meta_fields = formData.get('meta_fields') as string
  const matter = meta_fields
    .split(',')
    .filter(Boolean)
    .map(key => `${key}: ${formData.get(`meta__${key}`)}`)
    .join('\n')

  const content = matter ? ['---', matter, '---', '', body].join('\n') : body

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
  const redirectPath = `/p/${params.project}/${params.cid}/${returnPath}`

  const cookie = await setFlashMessage(request, `Pushed commit "${message}" successfully`)

  return redirect(redirectPath, {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

function PostDetailsHeader({ file, isDraft }: { file: CollectionFile, isDraft: boolean }) {
  const transition = useTransition()
  const busy = transition.state === 'submitting'
  const navigate = useNavigate()
  const { project, cid } = useParams()
  const backLink = `/p/${project}/${cid}`

  function handleDelete(ev: React.MouseEvent) {
    const isDelete = (ev.target as HTMLButtonElement).value === 'delete'
    if (isDelete && !window.confirm('¿Are you sure you want to delete this post?')) {
      ev.preventDefault()
    }
  }

  return (
    <div className="mb-2 flex items-center gap-2">
      <button
        onClick={() => navigate(backLink)}
        title="Back"
        aria-label="Back"
        type="button"
        className={`${buttonCN.normal} ${buttonCN.icon} ${buttonCN.cancel}`}>
        <ArrowLeftIcon className='w-5 h-5' />
      </button>
      <div className="relative flex-grow">
        <DocumentIcon className="w-5 h-5 absolute top-3 left-2" />
        <input type="text" placeholder="file name" className={`pl-9 ${inputCN}`} name="name" defaultValue={file.name} />
      </div>
      <button
        type='submit'
        name='_op'
        value='save'
        disabled={!isDraft || busy}
        className={`disabled:opacity-75 ${buttonCN.normal} ${buttonCN.slate} ${buttonCN.iconLeft}`}
      >
        <ArrowUpTrayIcon className="w-6 h-6" />
        <p className="hidden md:block">{busy ? 'Publishing...' : 'Publish'}</p>
      </button>
      <Menu as="div" className="z-20 relative">
        {({ open }) => (
          <>
            <Menu.Button
              as="button"
              type="button"
              title="Open actions menu"
              aria-label="Open actions menu"
              className={`p-2 -ml-3 border-l border-gray-300 rounded-r-md ${buttonCN.slate}`}
            >
              <EllipsisVerticalIcon className="w-6 h-6" />
            </Menu.Button> 
            <Transition
              show={open}
              enter="transition transform duration-100 ease-out"
              enterFrom="scale-y-50 opacity-0"
              enterTo="scale-y-100 opacity-100"
              leave="transition transform duration-100 ease-out"
              leaveFrom="scale-y-100 opacity-100"
              leaveTo="scale-y-50 opacity-0">
              <Menu.Items
                static
                className="mt-2 w-72 shadow-lg absolute top-full right-0 ring-1 ring-black ring-opacity-5">
                <div className="rounded-md text-left py-2 bg-white dark:bg-white/30">
                  <Menu.Item
                    as="button"
                    type="button"
                    className={`w-full text-left rounded-none ${buttonCN.iconLeft} ${buttonCN.normal} ${buttonCN.cancel}`}
                  >
                    <FolderOpenIcon className="w-5 h-5" />
                    <span>Move to another collection</span>
                  </Menu.Item>
                  <Menu.Item
                    as="button"
                    type="button"
                    onClick={() => window.location.reload()}
                    className={`w-full text-left rounded-none ${buttonCN.iconLeft} ${buttonCN.normal} ${buttonCN.cancel}`}
                  >
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                    <span>Discard unsaved changes</span>
                  </Menu.Item>
                  <Menu.Item
                    as="button"
                    type='submit'
                    name='_op'
                    value='delete'
                    disabled={busy}
                    onClick={handleDelete}
                    className={`dark:text-red-400 text-red-900 w-full text-left rounded-none ${buttonCN.iconLeft} ${buttonCN.normal} ${buttonCN.cancel}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                    <p>Delete file</p>
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  )
}

export default function PostDetails() {
  const { file, permissions } = useLoaderData<LoaderData>()
  const project = useProject()
  const [isDraft, setIsDraft] = useState(false)

  function saveDraft() {
    setIsDraft(true)
  }

  if (!permissions.push) {
    return (
      <div className="text-right text-red-800 rounded-xl p-3">
        <p className="text-lg">You don't have permission to push to this repo</p>
      </div>
    )
  }

  return (
    <Form method='post' className="py-4 px-2 md:px-4 mb-8">
      <header>
        <PostDetailsHeader file={file} isDraft={isDraft} />
        <p className="mb-6 ml-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
          <span className={`${isDraft ? 'bg-yellow-600' : 'bg-green-600'} w-2 h-2 mt-1 rounded inline-block`}></span>
          <span>{isDraft ? 'Unsaved changes' : 'Published'}</span>
        </p>
      </header>
      <div className="lg:flex flex-wrap items-stretch gap-4 mb-4">
        <PostEditor onDraft={saveDraft} />
        <FrontmatterEditor onDraft={saveDraft} />
      </div>
      <input type='hidden' name='sha' value={file.id} />
      <input type='hidden' name='path' value={file.path} />
      <input type='hidden' name='branch' value={project.branch} />
      <input type='hidden' name='repo' value={project.repo} />
    </Form>
  )
}
