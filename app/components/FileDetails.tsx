import {  useEffect, useState } from 'react'
import CodeEditor from './CodeEditor'
import type { ParsedFile } from '@/lib/github'
import FileLabel from './FileLabel'
import { Tab } from '@headlessui/react'
import { Form, Link, useLocation, useParams, useTransition } from '@remix-run/react'
import MarkdownPreview from './MarkdownPreview'

type FileDetailsProps = {
  repo: string
  file: ParsedFile
}

export default function FileDetails({ repo, file }: FileDetailsProps) {
  const transition = useTransition()
  const [tempContent, setTempContent] = useState('')
  const { '*': path } = useParams()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  params.delete('new')

  const tabButtonCN = ({ selected }: { selected: boolean }) => {
    const activeStyle = selected ? 'bg-slate-100 text-slate-700' : 'hover:underline'
    return `rounded-md px-4 py-2 ${activeStyle}`
  }

  useEffect(() => {
    if (file) {
      setTempContent(file.content || '')
    }
  }, [file])

  const busy = transition.state === 'submitting'

  return (
    <Form
      action={`/r/${repo}/${path}`}
      method='post'
      onSubmit={(ev) => {
        const op = ((ev.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)?.value
        if (op === 'delete' && !confirm('¿Estas seguro de que quieres borrar este archivo?')) {
          ev.preventDefault()
        }
      }}
      className="mt-1 flex-grow min-w-0 px-2">
      <div className='flex items-center justify-start mb-2'>
        <Link className='md:hidden mr-2' to={`/r/${repo}?${params}`} title='Back to file tree'>
          <BackIcon />
        </Link>
        <FileLabel />
      </div>
      {file?.isMarkdown ? (
        <Tab.Group as="div" className='mt-4'>
          <Tab.List className="mx-1">
            <Tab className={tabButtonCN}>Editor</Tab>
            <Tab className={tabButtonCN}>Preview</Tab>
          </Tab.List>
          <Tab.Panels className="-mt-1">
            <Tab.Panel>
              <CodeEditor
                name="markdown"
                file={file}
                initialValue={tempContent || file?.content || ''}
                onChange={setTempContent}
              />
            </Tab.Panel>
            <Tab.Panel>
              <div className='p-3 rounded-md border text-slate-700 bg-white border-gray-300'>
                <MarkdownPreview code={tempContent} />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>        
      ) : (
        <CodeEditor
          name="markdown"
          file={file}
          initialValue={tempContent || file?.content || ''}
          onChange={setTempContent}
        />
      )}

      <div className='flex items-center mt-2'>
        <button
          disabled={busy}
          type='submit'
          name='_op'
          value='delete'
          className='disabled:opacity-50 disabled:pointer-events-none py-2 px-4 rounded-md bg-red-50 text-red-700 hover:bg-red-100'>
          Delete
        </button>
        <div className='flex-grow'></div>
        <button
          disabled={busy}
          type='reset'
          className='py-2 px-4 rounded-md hover:text-slate-700 hover:bg-slate-100'>
          Reset
        </button>
        <button
          disabled={busy}
          type='submit'
          name='_op'
          value='save'
          className='disabled:opacity-50 disabled:pointer-events-none ml-2 py-2 px-4 rounded-md bg-slate-600 text-white hover:bg-slate-700'>
          Save
        </button>
        <input type="hidden" name="sha" value={file?.sha} />

      </div>
      {/* {modalOpen === 'commit' && <CommitModal file={file} content={tempContent} />} */}
    </Form>
  )
}

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
