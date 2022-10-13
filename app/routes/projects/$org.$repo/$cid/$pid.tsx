import { getFileContent, getRepoDetails } from "@/lib/github"
import type { CollectionFile, ProjectCollection } from "@/lib/projects.server"
import { processFileContent } from "@/lib/projects.server"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { buttonCN, inputCN } from "@/lib/styles"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react"
import { Tab } from '@headlessui/react'
import { useEffect, useState } from "react"
import CodeEditor from "@/components/CodeEditor"
import MarkdownPreview from "@/components/MarkdownPreview"

type LoaderData = {
  file: CollectionFile,
  collection: ProjectCollection
  permissions: {
    admin: boolean
    push: boolean
    pull: boolean
  }
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token, user } = await requireUserSession(request)
  const collectionId = params.cid
  const postFile = params.pid
  const repo = `${params.org}/${params.repo}`
  const project = await getProject(user.name, repo)
  const config = await getProjectConfig(token, project)
  const collection = config.collections.find((c) => c.id === collectionId)

  if (!collection) {
    throw new Response(`Collection ${collectionId} not found`, { status: 404, statusText: 'Not found' })
  }

  const folder = collection.route.replace(/^\//, '').replace(/\/$/, '')

  const [file, details] = await Promise.all([
    getFileContent(token, {
      repo,
      branch: project.branch,
      file: `${folder}/${postFile}`
    }),
    getRepoDetails(token, repo)
  ])

  if (!file) {
    throw new Response(`File ${postFile} not found in collection ${collection.id}`, {
      status: 404,
      statusText: 'Not found'
    })
  }

  return json<LoaderData>({
    collection,
    file: processFileContent(file),
    permissions: details.permissions
  })
}

function PostLabel() {
  const { file } = useLoaderData<LoaderData>()
  return (
    <div className="mb-4">
      <input
        name="title"
        type="text"
        defaultValue={file.title}
        placeholder="Title"
        className={`${inputCN} text-xl`}
      />
    </div>
  )
}

function PostBody() {
  const { file } = useLoaderData<LoaderData>()
  const [tempContent, setTempContent] = useState('')

  useEffect(() => {
    if (file) {
      setTempContent(file.body || '')
    }
  }, [file])

  const tabButtonCN = ({ selected }: { selected: boolean }) => {
    const activeStyle = selected ? buttonCN.slate : buttonCN.cancel
    return `${activeStyle} px-4 py-2 rounded-t-md font-medium`
  }

  return (
    <Tab.Group as="div" className='my-4'>
      <Tab.List className="mx-2 mt-8 flex items-center gap-2">
        <Tab className={tabButtonCN}>Editor</Tab>
        <Tab className={tabButtonCN}>Preview</Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <CodeEditor
            name="markdown"
            isMarkdown
            initialValue={tempContent || file.body || ''}
            onChange={setTempContent}
          />
        </Tab.Panel>
        <Tab.Panel>
          <div className='p-3 rounded-md border border-gray-300'>
            <MarkdownPreview code={tempContent} />
          </div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  )
}

export default function PostEditor() {
  const { file, permissions } = useLoaderData<LoaderData>()
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  return (
    <Form className="p-4">
      <PostLabel />
      <PostBody />
      {permissions.push ? (
        <div className='flex items-center'>
          <button
            disabled={busy}
            type='submit'
            name='_op'
            value='save'
            className={`${buttonCN.normal} ${buttonCN.slate}`}>
            {transition.state === 'submitting' && 'Saving...'}
            {transition.state === 'loading' && 'Saved!'}
            {transition.state === 'idle' && 'Save'}
          </button>
          <Link to='..'>
            <button
              type='button'
              className={`ml-2 ${buttonCN.normal} ${buttonCN.cancel}`}>
              Cancel
            </button>
          </Link>
          <div className='flex-grow'></div>
          <button
            disabled={busy}
            type='submit'
            name='_op'
            value='delete'
            className='disabled:opacity-50 disabled:pointer-events-none py-2 px-4 rounded-md bg-red-50 text-red-700 hover:bg-red-100'>
            Delete
          </button>
          <input type="hidden" name="sha" value={file?.id} />
        </div>
      ) : (
        <div className="text-right text-red-800 rounded-xl p-3">
          <p className="text-lg">You don't have permission to push to this repo</p>
        </div>
      )}
    </Form>
  )
}
