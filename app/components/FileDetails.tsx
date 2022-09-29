import { useEffect, useState } from 'react'
import CodeEditor from './CodeEditor'
// import CommitModal from './CommitModal'
// import MarkdownPreview from './MarkdownPreview'
import type { ParsedFile } from '@/lib/github'
import FileLabel from './FileLabel'
import { Tab } from '@headlessui/react'
import { Link } from '@remix-run/react'

type FileDetailsProps = {
  repo: string
  file: ParsedFile
}

export default function FileDetails({ repo, file }: FileDetailsProps) {
  const [tempContent, setTempContent] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState('')

  const tabButtonCN = ({ selected }: { selected: boolean }) => `mr-1 rounded-md px-4 py-2 ${selected ? 'bg-slate-100' : 'hover:underline'}`

  useEffect(() => {
    if (file) {
      setTempContent(file.content || '')
    }
  }, [file])

  // if (!file) {
  //   return null
  // }

  return (
    <form className="mt-1 flex-grow min-w-0 px-2" style={{ height: 'inherit' }}>
      <div className='flex items-center justify-start mb-2'>
        <Link className='md:hidden mr-2' to={`/r/${repo}`} title='Back to file tree'>
          <BackIcon />
        </Link>
        <div className='min-w-0 mr-2'>
          <FileLabel />
        </div>
      </div>
      {file?.isMarkdown ? (
        <Tab.Group as="div" className='mt-4'>
          <Tab.List>
            <Tab className={tabButtonCN}>Edit File</Tab>
            <Tab className={tabButtonCN}>Preview changes</Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel>
              <CodeEditor
                file={file}
                initialValue={tempContent || file?.content || ''}
                onChange={setTempContent}
              />
            </Tab.Panel>
            <Tab.Panel>
              <div className='p-3 rounded-md border border-gray-300'>... Preview ...</div>
              {/* <MarkdownPreview code={tempContent} /> */}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>        
      ) : (
        <CodeEditor
          file={file}
          initialValue={tempContent || file?.content || ''}
          onChange={setTempContent}
        />
      )}

      <div className='flex items-center mt-2'>
        <button type='submit' name='op' value='delete' className='py-2 px-4 rounded-md bg-red-50 text-red-700 hover:bg-red-100'>Delete</button>
        <div className='flex-grow'></div>
        <button type='reset' className='py-2 px-4 rounded-md text-slate-600 hover:bg-slate-100'>Reset</button>
        <button type='submit' name='op' value='create' className='ml-2 py-2 px-4 rounded-md bg-slate-600 text-white hover:bg-slate-700'>Save</button>
      </div>
      {/* {modalOpen === 'commit' && <CommitModal file={file} content={tempContent} />} */}
    </form>
  )
}

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}
