import { deleteFile, renameFile } from "@/lib/github"
import { folderFromCollection, getBasename, getDirname } from "@/lib/pathUtils"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"

export async function action({ params, request }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const redirectTarget = new URL(request.url).searchParams.get('redirectTarget')
  const referer = request.headers.get('referer')
  const refererPath = referer ? new URL(referer).pathname : `/p/${project.id}`

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

    if (path === newPath) {
      const cookie = await setFlashMessage(request, `Not moving from ${path} to ${newPath} because it's the same path`)
      return redirect(refererPath, { headers: { 'Set-Cookie': cookie }})
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
    if (redirectTarget === 'source') {
      return redirect(`/p/${project.id}/source/${newPath}`, { headers: { 'Set-Cookie': cookie }})
    }

    if (redirectTarget === 'post') {
      const conf = await getProjectConfig(token, project)
      const collection = conf.collections.find(c => folderFromCollection(c) === getDirname(newPath))
      const returnPath = collection ? `/p/${project.id}/${collection.id}/${getBasename(newPath)}` : `/p/${project.id}/source/${newPath}`
      return redirect(returnPath, { headers: { 'Set-Cookie': cookie }})
    }
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
    const returnPath = refererPath === `/p/${project.id}/media` ? refererPath : `${refererPath}/..`
    return redirect(returnPath, { headers: { 'Set-Cookie': cookie }})
  }
}
