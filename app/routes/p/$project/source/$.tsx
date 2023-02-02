import FileDetails from "@/components/source-files/FileDetails"
import { getFileContent, getRepoDetails, saveFile } from "@/lib/github"
import { getBasename } from "@/lib/pathUtils"
import { getProject } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import type { ActionArgs, LoaderArgs} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ request, params }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const file = params['*'] || ''
  const isNew = getBasename(file) === 'new'
  const project = await getProject(Number(params.project))

  const [details, content] = await Promise.all([
    getRepoDetails(token, project.repo),
    isNew
      ? Promise.resolve(null)
      : getFileContent(token, {
          file,
          repo: project.repo,
          branch: project.branch,
        })
  ])

  return json({ file: content, permissions: details.permissions })
}

export async function action({ request, params }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()
  const op = formData.get('_op')
  const name = formData.get('filename') as string
  const body = formData.get('markdown') as string
  const path = formData.get('path') as string
  const repo = formData.get('repo') as string
  const branch = formData.get('branch') as string
  const sha = formData.get('sha') as string | undefined

  if (!name) {
    throw new Response(`"filename" param is required in form data`, { status: 400, statusText: 'Bad Request' })
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
  const redirectPath = `/p/${params.project}/source/${returnPath}`

  const cookie = await setFlashMessage(request, `Pushed commit "${message}" successfully`)

  return redirect(redirectPath, {
    headers: {
      'Set-Cookie': cookie
    }
  })
}

export default function ProjectSourceDetails() {
  const { file } = useLoaderData()
  return (
    <div className="p-4">
      <FileDetails key={file?.sha} />    
    </div>
  )
}
