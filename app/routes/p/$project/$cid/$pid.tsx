import { getFileContent, saveFile } from "@/lib/github"
import type { CollectionFile } from "@/lib/projects.server"
import { processFileContent , getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import type { ActionArgs, LoaderFunction, MetaFunction} from "@remix-run/node"
import { redirect , json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { folderFromCollection, getBasename } from "@/lib/pathUtils"
import slugify from "@/lib/slugify"
import FrontmatterEditor from "@/components/post-details/FrontmatterEditor"
import PostEditor from "@/components/post-details/PostEditor"
import metaTitle from "@/lib/metaTitle"
import { useState } from "react"
import PostDetailsHeader from "@/components/post-details/PostDetailHeader"

type LoaderData = {
  file: CollectionFile,
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

  if (isNew) {
    return json<LoaderData>({
      file: {
        id: '',
        path: folder,
        body: '',
        title: '',
        attributes: {},
      },
    })
  }

  const file = await getFileContent(token, {
    file: `${folder}/${filename}`,
    repo: project.repo,
    branch: project.branch,
  })

  const etag = `"${file.sha}"`

  if (request.headers.get('If-None-Match') === etag) {
    return new Response(null, { status: 304 })
  }

  return json<LoaderData>({
    file: processFileContent(file),
  }, {
    headers: {
      'Cache-Control': 'private, max-age=0, must-revalidate',
      'Vary': 'Cookie',
      'Etag': etag,
    }
  })
}

export async function action({ request, params }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const { branch, repo } = await getProject(Number(params.project))
  const formData = await request.formData()
  const body = formData.get('markdown') as string
  const sha = formData.get('sha') as string
  const path = formData.get('path') as string

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

  const slug = slugify(formData.get('meta__title') as string || '')
  const fullPath = isNew ? `${path}/${slug}.md` : path

  const message = isNew
    ? `Create file ${fullPath}`
    : `Update file ${fullPath}`

  await saveFile(token, {
    branch,
    repo,
    sha,
    path: fullPath,
    message,
    content
  })

  const redirectPath = `/p/${params.project}/${params.cid}/${getBasename(fullPath)}`

  const cookie = await setFlashMessage(request, `Pushed commit "${message}" successfully`)

  return redirect(redirectPath, {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

export default function PostDetails() {
  const { file } = useLoaderData<LoaderData>()
  const [isDraft, setIsDraft] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isNew = !file.id

  function saveDraft() {
    setIsDraft(true)
  }

  const noTitle = isNew || file.title === getBasename(file.path)

  return (
    <Form method='post' className="py-4 px-2 md:px-4 mb-8">
      <header>
        <div className="group">
          <PostDetailsHeader file={file} isDraft={isDraft} />
          <div className="flex items-center justify-between mb-6 gap-4">
            {noTitle && (
              <p className="md:pl-11 text-xs md:opacity-0 group-hover:opacity-100 transition-opacity">
                You can change the post title by adding a <code>title</code> field in the fields section
              </p>
            )}
            {!isNew && (
              <p className="flex-grow flex items-center justify-end gap-2 text-sm text-slate-500 dark:text-slate-300">
                <span className={`${isDraft ? 'bg-yellow-600' : 'bg-green-600'} w-2 h-2 mt-1 rounded inline-block`}></span>
                <span>{isDraft ? 'Unsaved changes' : 'Published'}</span>
              </p>
            )}
          </div>
        </div>
      </header>
      <div className="lg:flex items-stretch gap-4 mb-4">
        <PostEditor
          onDraft={saveDraft}
          onToggle={() => setExpanded(!expanded)}
          expanded={expanded}
        />
        {!expanded && (
          <FrontmatterEditor onDraft={saveDraft} />
        )}
      </div>
      <input type='hidden' name='sha' value={file.id} />
      <input type='hidden' name='path' value={file.path} />
    </Form>
  )
}
