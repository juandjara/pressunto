import FileDetails from "@/components/FileDetails"
import { CommitParams, getFileContent, getRepoDetails, saveFile } from "@/lib/github"
import { requireUserSession } from "@/lib/session.server"
import type { ActionArgs, LoaderArgs} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ request, params }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const { org, repo } = params
  const fullRepo = `${org}/${repo}`
  const file = params['*']
  const sp = new URL(request.url).searchParams
  const isNew = sp.get('new') === 'true'
  const branch = sp.get('branch') || undefined

  const details = await getRepoDetails(token, fullRepo)
  const content = file ? await getFileContent(token, {
    repo: fullRepo,
    file,
    branch: branch || details.default_branch,
    isNew,
  }) : null

  return json({ org, repo, content, permissions: details.permissions })
}

export async function action({ request, params }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()
  const op = formData.get('_op')
  const name = formData.get('filename') as string
  const body = formData.get('markdown') as string
  const path = formData.get('path') as string

  if (!name) {
    throw new Response(`"filename" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }
  if (!body) {
    throw new Response(`"markdown" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }

  const sha = formData.get('sha') as string | undefined
  const isNew = !sha
  const branch = new URL(request.url).searchParams.get('branch') || undefined
  const { repo, org } = params
  const message = op === 'delete' 
    ? `Delete file ${path}${name}` 
    : isNew
      ? `Create file ${path}${name}`
      : `Update file ${path}${name}`

  const isDelete = op === 'delete'
  await saveFile(token, {
    branch,
    repo: `${org}/${repo}`,
    sha,
    name,
    path: path || '',
    message,
    method: isDelete ? 'DELETE' : 'PUT',
    content: body
  })

  const returnPath = isDelete ? '' : `${path}${name}`
  return redirect(`/r/${org}/${repo}/${returnPath}${branch ? `?branch=${branch}` : ''}`)
}

export default function FileDetailsPage() {
  const { content } = useLoaderData()
  return (
    <FileDetails key={content?.sha} />
  )
}
