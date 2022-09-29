import FileDetails from "@/components/FileDetails"
import { getFileContent, getRepoDetails } from "@/lib/github"
import { requireUserSession } from "@/lib/session.server"
import type { LoaderArgs } from "@remix-run/node"
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

  return json({ org, repo, content, permissions: details.permissions }, {
    headers: {
      'Vary': 'Cookie',
      'Cache-control': 'max-age=60'
    }
  })
}

export default function FileDetailsPage() {
  const { org, repo, content } = useLoaderData()
  return (
    <FileDetails key={content?.sha} repo={`${org}/${repo}`} file={content} />
  )
}
