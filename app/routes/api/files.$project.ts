import { deleteFile, renameFile } from "@/lib/github"
import { getBasename, getDirname } from "@/lib/pathUtils"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import { uploadImage } from "@/lib/uploadImage"
import type { ActionArgs, UploadHandlerPart } from "@remix-run/node"
import { json, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"

export async function action({ params, request }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const conf = await getProjectConfig(token, project)
  const folder = conf.mediaFolder === '/' ? '' : conf.mediaFolder || ''

  // differiantiate between "file upload" and "file edit / delete" using http method to not affect the reading of form data

  // upload file
  if (request.method.toLowerCase() === 'post') {
    async function githubUploadHandler({ name, contentType, data, filename }: UploadHandlerPart) {
      if (name !== 'file' || !filename) {
        return
      }

      const file = await uploadImage(token, {
        repo: project.repo,
        branch: project.branch,
        folder,
        file: {
          contentType,
          data,
          filename,
        }
      })
      return file.content.path
    }
  
    const uploadHandler = unstable_composeUploadHandlers(
      githubUploadHandler,
      unstable_createMemoryUploadHandler(),
    )
  
    const formData = await unstable_parseMultipartFormData(request, uploadHandler)
    const files = formData.getAll('file') as string[]
    const cookie = await setFlashMessage(request, `Pushed commit "upload image ${files} to ${folder || 'root folder'}" successfully`)
    return json({ ok: true }, { headers: { 'Set-Cookie': cookie }})
  }

  // rename file or move to other folder
  if (request.method.toLowerCase() === 'put') {
    const fd = await request.formData()
    const sha = fd.get('sha') as string
    const path = fd.get('path') as string
    const operation = fd.get('operation') as 'move' | 'rename'

    let newPath = ''
    if (operation === 'move') {
      const folder = fd.get('folder') as string
      newPath = `${folder}/${getBasename(path)}`
    }
    if (operation === 'rename') {
      const name = fd.get('name') as string
      newPath = `${getDirname(path)}/${name}`
    }

    const message = `Move file ${path} to ${newPath}`
    await renameFile(token, {
      repo: project.repo,
      branch: project.branch,
      sha,
      path,
      newPath,
      message
    })

    const cookie = await setFlashMessage(request, `Pushed commit "${message}" successfully`)
    return json({ ok: true }, { headers: { 'Set-Cookie': cookie }})
  }

  // delete file
  if (request.method.toLowerCase() === 'delete') {
    const fd = await request.formData()
    const path = fd.get('path') as string

    const message = `Delete file ${path}`
    await deleteFile(token, {
      branch: project.branch,
      repo: project.repo,
      message,
      path,
    })

    const cookie = await setFlashMessage(request, `Pushed commit "${message}" successfully`)
    return json({ ok: true }, { headers: { 'Set-Cookie': cookie }})
  }
}
