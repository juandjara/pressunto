import FileDetails from "@/components/FileDetails"
import { getFileContent, getRepoDetails, saveFile } from "@/lib/github"
import { getBasename } from "@/lib/pathUtils"
import { getProject } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import type { ActionArgs, LoaderArgs} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ request, params }: LoaderArgs) {
  const { token, user } = await requireUserSession(request)
  const file = params['*'] || ''
  const isNew = getBasename(file) === 'new'
  const repo = `${params.org}/${params.repo}`
  const project = await getProject(user.name, repo)

  const branch = project.branch || 'master'
  const [details, content] = await Promise.all([
    getRepoDetails(token, repo),
    isNew
      ? Promise.resolve(null)
      : getFileContent(token, {
          repo,
          file,
          branch: project.branch,
        })
  ])

  return json({ branch, file: content, permissions: details.permissions })
}

export async function action({ request, params }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()
  const op = formData.get('_op')
  const name = formData.get('filename') as string
  const body = formData.get('markdown') as string
  const path = formData.get('path') as string
  const branch = formData.get('branch') as string
  const sha = formData.get('sha') as string | undefined
  const repo = `${params.org}/${params.repo}`

  if (!name) {
    throw new Response(`"filename" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }
  if (!body) {
    throw new Response(`"markdown" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }

  const isNew = !sha
  const message = op === 'delete' 
    ? `Delete file ${path + name}`
    : isNew
      ? `Create file ${path + name}`
      : `Update file ${path + name}`

  const isDelete = op === 'delete'

  await saveFile(token, {
    branch,
    repo,
    sha,
    name,
    path: path || '',
    message,
    method: isDelete ? 'DELETE' : 'PUT',
    content: body
  })

  const returnPath = isDelete ? '' : path + name
  const redirectPath = `/projects/${repo}/source/${returnPath}`

  return redirect(redirectPath)
}

export default function ProjectSourceDetails() {
  const { file } = useLoaderData()
  return (
    <div className="p-4">
      <FileDetails key={file?.sha} />    
    </div>
  )
}
