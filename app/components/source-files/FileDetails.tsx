import { useEffect, useState } from 'react'
import FileEditor from './FileEditor'
import { FileMode, type ParsedFile } from '@/lib/github'
import { Form, Link, useLoaderData, useNavigation, useParams } from '@remix-run/react'
import { borderColor, buttonCN, inputCNSmall } from '@/lib/styles'
import { cleanRoute, getBasename, getDirname } from '@/lib/pathUtils'
import clsx from 'clsx'
import { DocumentIcon } from '@heroicons/react/24/outline'
import FileActionsMenu from '../file-actions/FileActionsMenu'
import type { FileModalData } from '../file-actions/FileActionsModal'
import FileActionsModal from '../file-actions/FileActionsModal'
import useProjectConfig, { useRepoTree } from '@/lib/useProjectConfig'

type LoaderData = {
  file: ParsedFile | null
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
        name="body"
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
      name="body"
      isMarkdown={file?.isMarkdown}
      initialValue={tempContent || file?.content || ''}
      onChange={setTempContent}
    />
  )
}

function MarkdownBanner({ className = '', file }: { className?: string; file?: ParsedFile }) {
  const config = useProjectConfig()
  const folder = file && cleanRoute(getDirname(file?.path || ''))
  const collection = file && config.collections.find((c) => folder === cleanRoute(c.route))

  if (!file?.isMarkdown) {
    return null
  }

  if (collection) {
    return (
      <p className={className}>
        This file is in the <Link className='underline' to={`../${collection.id}`}>{collection.name}</Link> collection.
      </p>
    )
  }

  return (
    <p className={className}>
      Want to edit this file with the advanced markdown editor?
      Add the file to a <Link className='underline' to={`../settings`}>collection</Link> and edit it there.
    </p>
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
      <input type="hidden" name="sha" value={file?.sha} />
      <input type="hidden" name="path" value={file?.path} />
      <header className='relative flex items-center justify-start gap-2'>
        <Link
          className={clsx(buttonCN.cancel, buttonCN.small, buttonCN.iconSmall)}
          to={`./?open=${folder}`}
          title='Back to file tree'>
          <BackIcon />
        </Link>
        <div className={clsx(
          'text-slate-500 dark:text-slate-200',
          'pl-2 flex-grow min-w-0 flex items-center border-l', borderColor
        )}>
          <DocumentIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          {folder && (
            <span className='truncate text-slate-400 dark:text-slate-500'>{folder}/</span>
          )}
          <input
            type="text"
            name="name"
            defaultValue={basename === 'new' ? undefined : basename}
            placeholder='new file'
            required
            className={clsx(
              inputCNSmall,
              'basis-[50%] flex-grow ml-2'
            )}
          />
        </div>
        <FileActionsMenu
          file={{
            mode: FileMode.FILE,
            path: file?.path || '',
            sha: file?.sha || '',
            type: 'blob',
          }}
          hasGroupTransition={false}
          setModalData={setModalData}
          wrapperCN=''
          buttonCN='p-1'
          menuPosition='top-full right-0 mt-2'
          externalLink={file?.html_url}
        />
      </header>
      <div className='my-4'>
        <MarkdownBanner className='mb-4' file={file || undefined} />
        <FileContents file={file || undefined} />
      </div>
      {!file?.isBinary && (
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
      )}
    </Form>
  )
}
