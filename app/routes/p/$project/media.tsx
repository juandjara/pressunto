import { ComboBoxLocal } from "@/components/ComboBoxLocal"
import type { TreeItem } from "@/lib/github"
import { getRepoFiles } from "@/lib/github"
import { getProject } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN, iconCN, labelCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { PhotoIcon } from "@heroicons/react/20/solid"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import isBinaryPath from "is-binary-path"
import { useState } from "react"

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const tree = await getRepoFiles(token, project.repo, project.branch)
  return json({ tree })
}

export default function Media() {
  const conf = useProjectConfig()
  const { tree } = useLoaderData<{ tree: TreeItem[] }>()
  const [mediaFolder, setMediaFolder] = useState(conf.mediaFolder || '')
  const folders = tree.filter(t => t.type === 'tree')
  const images = tree.filter(t => isBinaryPath(t.path) && t.path.includes(mediaFolder))

  console.log(images)

  return (
    <div className="p-4">
      <header>
        <h2 className="font-medium text-4xl text-slate-500 dark:text-slate-300 mt-4 mb-2">
          Media
        </h2>
        <p className="max-w-prose font-medium">
          This page lists all the images in your repository
        </p>
      </header>
      <Form replace method="post" className="py-8">
        <label htmlFor="mediaFolder" className={labelCN}>
          Media Folder
          <small> - Where are your images stored</small>
        </label>
        <div className="flex items-center gap-2">
          <ComboBoxLocal<TreeItem>
            name='mediaFolder'
            options={folders}
            labelKey='path'
            valueKey='path'
            onSelect={setMediaFolder}
          />
          <button name='_op' value='config' className={`${buttonCN.normal} ${buttonCN.slate}`}>Save</button>
        </div>
      </Form>
      <ul className="space-y-4 my-6">
        {images.map(f => (
          <li key={f.sha}>
            <Link to={`../source/${f.path}`} className="p-2 rounded-md flex items-center gap-2 bg-slate-100 dark:bg-slate-700">
              <PhotoIcon className={iconCN.small} />
              <p className="text-lg">{f.path}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
