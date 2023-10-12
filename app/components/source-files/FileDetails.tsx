import { useEffect, useState } from 'react'
import FileEditor from './FileEditor'
import type { ParsedFile, Permissions } from '@/lib/github'
import FileLabel from './FileLabel'
import { Form, Link, useLoaderData, useNavigation, useParams } from '@remix-run/react'
import { buttonCN } from '@/lib/styles'
import { getBasename } from '@/lib/pathUtils'

type LoaderData = {
  branch: string
  file: ParsedFile
  permissions: Permissions
}

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function FileContents({ file }: { file?: ParsedFile }) {
  const [tempContent, setTempContent] = useState('')

  useEffect(() => {
    if (file) {
      setTempContent(file.content || '')
    }
  }, [file])

  if (!file || file.isMarkdown) {
    return (
      <FileEditor
        name="markdown"
        isMarkdown={file ? file.isMarkdown : true}
        initialValue={tempContent || file?.content || ''}
        onChange={setTempContent}
      />
    )
  }

  if (file.format === 'image') {
    return (
      <div className='p-3 border border-slate-300 rounded-md'>
        <div>
          <img
            alt={`file ${getBasename(file.path)} from github`}
            src={file.download_url}
            className='max-w-full object-contain mx-auto'
          />
        </div>
      </div>
    )
  }

  if (file.isBinary) {
    return (
      <div className='p-3 border border-slate-300 rounded-md text-center'>
        <p className='text-sm font-medium mb-2'>This file is not a text format or image that can be edited by this application.</p>
        <a className='underline' target='_blank' rel='noreferrer' href={file.html_url}>See raw file</a>
      </div>
    )
  }

  return (
    <FileEditor
      name="markdown"
      isMarkdown={file?.isMarkdown}
      initialValue={tempContent || file?.content || ''}
      onChange={setTempContent}
    />
  )
}

export default function FileDetails() {
  const { file } = useLoaderData<LoaderData>()
  const path = useParams()['*']
  const transition = useNavigation()
  const busy = transition.state === 'submitting'

  function handleSubmit(ev: React.MouseEvent) {
    const isDelete = (ev.target as HTMLButtonElement).value === 'delete'
    if (isDelete && !window.confirm('¿Are you sure you want to delete this file?')) {
      ev.preventDefault()
    }
  }

  return (
    <Form method='post' action={path}>
      <div className='flex items-center justify-start'>
        <Link className='md:hidden mr-2' to='../source' title='Back to file tree'>
          <BackIcon />
        </Link>
        <FileLabel />
      </div>
      <div className='my-4'>
        <FileContents file={file} />
      </div>
      <div className='flex items-center'>
        <button
          disabled={busy}
          type='submit'
          name='_op'
          value='save'
          className={`${buttonCN.normal} ${buttonCN.slate}`}>
          {busy ? 'Saving...' : 'Save'}
        </button>
        <Link to='../source'>
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
          onClick={handleSubmit}
          className='disabled:opacity-50 disabled:pointer-events-none py-2 px-4 rounded-md bg-red-50 text-red-700 hover:bg-red-100'>
          Delete
        </button>
        <input type="hidden" name="sha" value={file?.sha} />
      </div>
    </Form>
  )
}
