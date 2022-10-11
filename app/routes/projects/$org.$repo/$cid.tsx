import { getRepoFiles, isMarkdown, TreeItem } from "@/lib/github"
import { getProject, getProjectConfig, ProjectCollection } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import useProjectConfig from "@/lib/useProjectConfig"
import { json, LoaderFunction } from "@remix-run/node"
import { Link, useLoaderData, useParams } from "@remix-run/react"

function getDirname(path: string) {
  return path.split('/').slice(0, -1).join('/')
}

function getBasename(path: string) {
  return path.split('/').slice(-1)[0]
}

type LoaderData = {
  files: TreeItem[]
  collection: ProjectCollection
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token, user } = await requireUserSession(request)
  const collectionId = params.cid
  const repo = `${params.org}/${params.repo}`
  
  const project = await getProject(user.name, repo)
  const config = await getProjectConfig(token, project)
  const collection = config.collections.find((c) => c.id === collectionId)
  if (!collection) {
    throw new Response(`Collection "${collectionId}" not found`, { status: 404, statusText: 'Not found' })
  }

  const tree = await getRepoFiles(token, project.repo, project.branch || 'master')
  console.log(collection.route)
  console.log(tree)
  const files = tree.filter((f) => {
    const inCollection = getDirname(f.path) === collection.route.replace(/^\//, '')
    return inCollection && isMarkdown(f.path)
  })

  return json<LoaderData>({ files, collection })
}

const listCN = 'flex items-center pl-4 p-2 rounded-md text-lg bg-slate-100 dark:bg-slate-700'

export default function CollectionDetails() {
  const { files, collection } = useLoaderData<LoaderData>()

  return (
    <div className="p-4">
      <h2 className="font-medium text-4xl mb-8">{collection.name}</h2>
      <ul className="space-y-4">
        {files.map((f) => (
          <li key={f.sha}>
            <Link to={getBasename(f.path)} className={listCN}>
              {getBasename(f.path)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
