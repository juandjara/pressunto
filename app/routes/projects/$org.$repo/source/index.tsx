import FileTree from "@/components/FileTree"
import type { TreeItem } from "@/lib/github"
import { getRepoFiles } from "@/lib/github"
import { getProject } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

type LoaderData = {
  tree: TreeItem[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token, user } = await requireUserSession(request)
  const repo = `${params.org}/${params.repo}`
  const project = await getProject(user.name, repo)
  const tree = await getRepoFiles(token, repo, project.branch || 'master')

  return json<LoaderData>({ tree })
}

export default function ProjectSource() {
  const { tree } = useLoaderData<LoaderData>()
  console.log(tree)
  return (
    <div className="p-4">
      <h2 className="font-medium text-4xl my-4">Source Code</h2>
      <p className="text-lg">
        Here you can browse and edit all the code for this project, using a basic editor not focused on Markdown content
      </p>
      <div className="py-8">
        <FileTree tree={tree} />
      </div>
    </div>
  )
}
