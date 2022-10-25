import { getFileContent, getRepoDetails, saveFile } from "@/lib/github"
import type { CollectionFile, ProjectConfig } from "@/lib/projects.server"
import { processFileContent } from "@/lib/projects.server"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN } from "@/lib/styles"
import type { ActionArgs, LoaderFunction, MetaFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useLoaderData, useParams, useTransition } from "@remix-run/react"
import { useProject } from "@/lib/useProjectConfig"
import { getBasename } from "@/lib/pathUtils"
import slugify from "@/lib/slugify"
import FrontmatterEditor from "@/components/post-details/FrontmatterEditor"
import PostEditor from "@/components/post-details/PostEditor"

type LoaderData = {
  file: CollectionFile,
  config: ProjectConfig,
  permissions: {
    admin: boolean
    push: boolean
    pull: boolean
  }
}

export const meta: MetaFunction = ({ data, params, location }) => {
  const title = (data as LoaderData).file.title
  return {
    title: `${title} | Pressunto`
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

export default function PostDetails() {
  const { cid: collectionId } = useParams()
  const { config, file, permissions } = useLoaderData<LoaderData>()
  const project = useProject()
  const collection = config.collections.find((c) => c.id === collectionId)
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  function handleSubmit(ev: React.MouseEvent) {
    const isDelete = (ev.target as HTMLButtonElement).value === 'delete'
    if (isDelete && !window.confirm('¿Are you sure you want to delete this post?')) {
      ev.preventDefault()
    }
  }

  return (
    <Form method='post' className="py-4 px-2 md:px-4 mb-8">
      <div className="lg:flex flex-wrap items-stretch gap-4 mb-4">
        <PostEditor />
        <FrontmatterEditor />
      </div>
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
