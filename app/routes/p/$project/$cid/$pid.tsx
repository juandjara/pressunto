import { getFileContent, saveFile } from "@/lib/github"
import type { CollectionFile } from "@/lib/projects.server"
import { processFileContent , getProject, getProjectConfig, saveDraft, deleteDraft, getDraft } from "@/lib/projects.server"
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
import { TITLE_FIELD } from "@/lib/fileUtils"
import clsx from "clsx"

type LoaderData = {
  file: CollectionFile,
  isDraft: boolean
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
      isDraft: false
    })
  }

  const fullPath = `${folder}/${filename}`

  const draft = await getDraft(project.id, fullPath)
  if (draft) {
    return json<LoaderData>({ file: draft, isDraft: true })
  }

  const file = await getFileContent(token, {
    file: fullPath,
    repo: project.repo,
    branch: project.branch,
  })

  return json<LoaderData>({ file: processFileContent(file), isDraft: false })
}

export async function action({ request, params }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const { repo, branch } = project
  const formData = await request.formData()
  const body = formData.get('body') as string
  const sha = formData.get('sha') as string | null
  const path = formData.get('path') as string

  if (!body) {
    throw new Response(`"body" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }

  if (!path) {
    throw new Response(`"path" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }

  const isNew = !sha
  const title = formData.get('title') as string | null
  const fullPath = isNew
    ? `${path}/${slugify((title || '').trim() || 'untitled')}.md`
    : path

  const message = isNew
    ? `Create file ${fullPath}`
    : `Update file ${fullPath}`

  const meta_fields = formData.get('meta_fields') as string
  const matter = meta_fields
    .split(',')
    .filter(f => f && f !== TITLE_FIELD)
    .map(key => `${key}: ${formData.get(`meta__${key}`)}`)
    .concat(title ? [`${TITLE_FIELD}: ${title}`] : [])
    .join('\n')

  const content = matter ? ['---', matter, '---', '', body].join('\n') : body

  const isDeleteDraft = formData.get('delete_draft') === 'true'
  if (isDeleteDraft) {
    await deleteDraft(project.id, fullPath)
    const cookie = await setFlashMessage(request, `Draft for "${getBasename(fullPath)}" deleted successfully`)
    return redirect(request.url, {
      headers: {
        'Set-Cookie': cookie
      }
    })
  }

  const isDraft = formData.get('draft') === 'true'
  if (isDraft && !isNew) {
    await saveDraft(token, {
      project,
      file: {
        id: sha,
        path: fullPath,
        body,
        title: title || getBasename(fullPath),
        attributes: Object.fromEntries(
          matter.split('\n').map(line => {
            const [key, ...value] = line.split(':')
            return [key.trim(), value.join(':').trim()]
          })
        )
      }
    })
    const cookie = await setFlashMessage(request, `Saved draft for "${getBasename(fullPath)}" successfully`)
    return redirect(request.url, {
      headers: {
        'Set-Cookie': cookie
      }
    })
  } else {
    await deleteDraft(project.id, fullPath)
  }

  try {
    await saveFile(token, {
      branch,
      repo,
      sha: sha || undefined,
      path: fullPath,
      message,
      content
    })
  } catch (err) {
    if ((err as Response).status === 409) {
      const cookie = await setFlashMessage(request, `Conflict: File ${getBasename(fullPath)} has been updated by someone else. Please refresh the page to get the latest version.`)
      return redirect(request.url, {
        headers: {
          'Set-Cookie': cookie
        }
      })
    }
    throw err
  }

  const redirectPath = `/p/${params.project}/${params.cid}/${getBasename(fullPath)}`

  const cookie = await setFlashMessage(request, `Pushed commit "${message}" successfully`)

  return redirect(redirectPath, {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

export default function PostDetails() {
  const { file, isDraft } = useLoaderData<LoaderData>()
  const [isTouched, setIsTouched] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isNew = !file.id

  function onTouched() {
    setIsTouched(true)
  }

  const noTitle = isNew || file.title === getBasename(file.path)

  return (
    <Form method='post' className="py-4 px-2 md:px-4 mb-8">
      <header>
        <div className="group">
          <PostDetailsHeader
            file={file}
            isTouched={isTouched}
            isDraft={isDraft}
          />
          <div className="flex items-center justify-between mb-6 gap-4">
            {noTitle && (
              <p className="md:pl-11 text-xs md:opacity-0 group-hover:opacity-100 transition-opacity">
                Filling in this field will add a <code>title</code> field to your post attributes.
              </p>
            )}
            {!isNew && (
              <p className="flex-grow flex items-center justify-end gap-2 text-sm text-slate-500 dark:text-slate-300">
                <span className={clsx(
                  'w-2 h-2 rounded inline-block',
                  isTouched
                    ? 'bg-yellow-600'
                    : isDraft
                      ? 'bg-green-600/50'
                      : 'bg-green-600'
                )}></span>
                <span>
                  {isTouched
                    ? 'Unsaved changes'
                    : isDraft
                      ? 'Saved draft'
                      : 'Published'
                  }
                </span>
              </p>
            )}
          </div>
        </div>
      </header>
      <div className="lg:flex items-stretch gap-4 mb-4">
        <PostEditor
          onDraft={onTouched}
          onToggle={() => setExpanded(!expanded)}
          expanded={expanded}
        />
        {!expanded && (
          <FrontmatterEditor onDraft={onTouched} />
        )}
      </div>
      <input type='hidden' name='sha' value={file.id} />
      <input type='hidden' name='path' value={file.path} />
    </Form>
  )
}
