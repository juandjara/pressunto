import type { Permissions} from "@/lib/github"
import { deleteFile, getFileContent, getRepoDetails, saveFile } from "@/lib/github"
import type { CollectionFile, ProjectConfig } from "@/lib/projects.server"
import { processFileContent } from "@/lib/projects.server"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import type { ActionArgs, LoaderFunction, MetaFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { useProject } from "@/lib/useProjectConfig"
import { folderFromCollection, getBasename } from "@/lib/pathUtils"
import slugify from "@/lib/slugify"
import FrontmatterEditor from "@/components/post-details/FrontmatterEditor"
import PostEditor from "@/components/post-details/PostEditor"
import metaTitle from "@/lib/metaTitle"
import { useState } from "react"
import PostDetailsHeader from "@/components/post-details/PostDetailHeader"

type LoaderData = {
  file: CollectionFile,
  config: ProjectConfig,
  permissions: Permissions
}

export const meta: MetaFunction = ({ data }) => {
  return {
    title: metaTitle((data as LoaderData)?.file?.title)
  }
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token } = await requireUserSession(request)
  const collectionId = params.cid
  const filename = params.pid
  const project = await getProject(Number(params.project))
  const config = await getProjectConfig(token, project)
  const collection = config.collections.find((c) => c.id === collectionId)

  if (!collection) {
    throw new Response(`Collection ${collectionId} not found`, { status: 404 })
  }

  const folder = folderFromCollection(collection)
  const isNew = filename === 'new'

  const blankFile = {
    sha: '',
    path: folder,
    content: ''
  }

  const [file, details] = await Promise.all([
    isNew ? Promise.resolve(blankFile) : getFileContent(token, {
      repo: project.repo,
      branch: project.branch,
      file: `${folder}/${filename}`
    }),
    getRepoDetails(token, project.repo)
  ])

  if (!file) {
    throw new Response(`File ${filename} not found in folder ${folder}`, { status: 404 })
  }

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
  const fullPath = isNew ? `${path}/${slug}.md` : path

  const message = op === 'delete' 
  ? `Delete file ${fullPath}` 
  : isNew
    ? `Create file ${fullPath}`
    : `Update file ${fullPath}`


  if (isDelete) {
    await deleteFile(token, {
      branch,
      repo,
      path: fullPath,
      message,
    })
  } else {
    await saveFile(token, {
      branch,
      repo,
      sha,
      path: fullPath,
      message,
      content
    })
  }

  const returnPath = isDelete ? '' : getBasename(fullPath)
  const redirectPath = `/p/${params.project}/${params.cid}/${returnPath}`

  const cookie = await setFlashMessage(request, `Pushed commit "${message}" successfully`)

  return redirect(redirectPath, {
    headers: {
      'Set-Cookie': cookie
    }
  })
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
        <p className="mb-6 ml-1 flex items-center justify-end gap-2 text-sm text-slate-500 dark:text-slate-300">
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
