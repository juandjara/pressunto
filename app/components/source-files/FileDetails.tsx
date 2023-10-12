import { useEffect, useState } from 'react'
import FileEditor from './FileEditor'
import { FileMode, type ParsedFile, type Permissions } from '@/lib/github'
import { Form, Link, useLoaderData, useNavigation, useParams } from '@remix-run/react'
import { buttonCN } from '@/lib/styles'
import { getBasename, getDirname } from '@/lib/pathUtils'
import clsx from 'clsx'
import { FolderOpenIcon } from '@heroicons/react/20/solid'
import FileActionsMenu from '../file-actions/FileActionsMenu'
import type { FileModalData } from '../file-actions/FileActionsModal'
import FileActionsModal from '../file-actions/FileActionsModal'
import { useRepoTree } from '@/lib/useProjectConfig'

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
  const path = useParams()['*'] || ''
  const basename = getBasename(path)
  const folder = getDirname(path)
  const transition = useNavigation()
  const busy = transition.state === 'submitting'
  const [modalData, setModalData] = useState<FileModalData | null>(null)
  const tree = useRepoTree()
  const folders = tree.filter((item) => item.type === 'tree')

  return (
    <Form method='post' action={path}>
      {modalData && (
        <FileActionsModal
          folders={folders}
          modalData={modalData}
          onClose={() => setModalData(null)}
          redirectTarget="source"
        />
      )}
      <header className='relative flex items-center justify-start gap-2'>
        <Link
          className={clsx(buttonCN.cancel, buttonCN.small, buttonCN.iconSmall)}
          to={`./?open=${folder}`}
          title='Back to file tree'>
          <BackIcon />
        </Link>
        <div className='bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-200 flex-grow min-w-0 py-1 px-2 rounded-md flex items-center gap-2'>
          <FolderOpenIcon className="w-5 h-5" />
            <span className='truncate'>
            {folder && (
              <span className='text-slate-400 dark:text-slate-500'>{folder}/</span>
            )}
            <span className='font-medium'>{basename}</span>
          </span>
        </div>
        <FileActionsMenu
          file={{
            mode: FileMode.FILE,
            path: file.path,
            sha: file.sha,
            type: 'blob',
          }}
          hasGroupTransition={false}
          setModalData={setModalData}
          wrapperCN=''
          buttonCN='p-1'
          menuPosition='top-full right-0 mt-2'
          externalLink={file.html_url}
        />
      </header>
      <div className='my-4'>
        <input type="hidden" name="sha" value={file?.sha} />
        <FileContents file={file} />
      </div>
      <footer className='flex items-center'>
        <button
          disabled={busy}
          type='submit'
          className={`${buttonCN.normal} ${buttonCN.slate}`}>
          {busy ? 'Saving...' : 'Save'}
        </button>
        <Link to={`./?open=${folder}`}>
          <button
            type='button'
            className={`ml-2 ${buttonCN.normal} ${buttonCN.cancel}`}>
            Cancel
          </button>
        </Link>
      </footer>
    </Form>
  )
}
