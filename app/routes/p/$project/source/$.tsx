import FileDetails from "@/components/source-files/FileDetails"
import { getFileContent, saveFile } from "@/lib/github"
import { getBasename } from "@/lib/pathUtils"
import { getProject } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import type { ActionArgs, LoaderArgs} from "@remix-run/node"
import { redirect , json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ request, params }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const filename = params['*'] || ''
  const isNew = getBasename(filename) === 'new'
  if (isNew) {
    return json({ file: null })
  }

  const project = await getProject(Number(params.project))
  const file = await getFileContent(token, {
    file: filename,
    repo: project.repo,
    branch: project.branch,
  })

  if (file.type === 'dir') {
    return redirect(`/p/${params.project}/source?open=${filename}`)
  }

  return json({ file })
}

export async function action({ request, params }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const { branch, repo } = await getProject(Number(params.project))
  const formData = await request.formData()
  const name = formData.get('filename') as string
  const body = formData.get('markdown') as string
  const path = formData.get('path') as string
  const sha = formData.get('sha') as string | undefined

  if (!name) {
    throw new Response(`"filename" param is required in form data`, { status: 400, statusText: 'Bad Request' })
  }

  const isNew = !sha
  const message = isNew
    ? `Create file ${path + name}`
    : `Update file ${path + name}`
  const fullPath = (path || '') + name

  await saveFile(token, {
    branch,
    repo,
    sha,
    path: fullPath,
    message,
    content: body
  })

  const redirectPath = `/p/${params.project}/source/${fullPath}`
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
