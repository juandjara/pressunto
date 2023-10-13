import type { CollectionFile } from "@/lib/projects.server"
import { buttonCN, iconCN, inputCN } from "@/lib/styles"
import { useNavigate, useParams, useNavigation } from "@remix-run/react"
import { ArrowDownOnSquareStackIcon, ArrowLeftIcon, ArrowUpTrayIcon, ArrowUturnLeftIcon, DocumentIcon } from "@heroicons/react/24/outline"
import { EllipsisVerticalIcon, FolderOpenIcon, TrashIcon } from "@heroicons/react/24/solid"
import { Menu, Transition } from "@headlessui/react"
import clsx from "clsx"
import { folderFromCollection, getBasename } from "@/lib/pathUtils"
import type { FileModalData } from "../file-actions/FileActionsModal"
import type { TreeItem } from "@/lib/github"
import { FileMode } from "@/lib/github"
import { PencilIcon } from "@heroicons/react/20/solid"
import { useState } from "react"
import FileActionsModal from "../file-actions/FileActionsModal"
import useProjectConfig from "@/lib/useProjectConfig"

export default function PostDetailsHeader({
  file,
  isTouched,
  isDraft
}: {
  file: CollectionFile,
  isTouched: boolean
  isDraft: boolean
}) {
  const transition = useNavigation()
  const busy = transition.state === 'submitting'
  const navigate = useNavigate()
  const { project, cid } = useParams()
  const backLink = `/p/${project}/${cid}`
  const isNew = !file.id
  const [modalData, setModalData] = useState<FileModalData | null>(null)
  const conf = useProjectConfig()
  const folders = conf.collections.map((c) => {
    return {
      mode: FileMode.TREE,
      path: folderFromCollection(c),
      sha: c.id,
      type: 'tree' as const,
    } as TreeItem
  })

  function openModal(operation: FileModalData['operation']) {
    setModalData({
      operation,
      file: {
        mode: FileMode.FILE,
        path: file.path,
        sha: file.id,
        type: 'blob' as const,
      }
    })
  }

  const noTitle = isNew || file.title === getBasename(file.path)
  const placeholder = isNew 
    ? 'New Post' 
    : noTitle
      ? file.title
      : 'Post title'

  return (
    <div className="mb-2 flex items-center gap-2">
      {modalData && (
        <FileActionsModal
          folders={folders}
          modalData={modalData}
          onClose={() => setModalData(null)}
          redirectTarget="post"
        />
      )}
      <button
        onClick={() => navigate(backLink)}
        title="Back"
        aria-label="Back"
        type="button"
        className={`${buttonCN.normal} ${buttonCN.icon} ${buttonCN.cancel}`}>
        <ArrowLeftIcon className='w-5 h-5' />
      </button>
      <div className={clsx('flex-grow mr-1 relative')}>
        <DocumentIcon className={clsx('absolute top-[11px] left-2', iconCN.small)} />
        <input
          type="text"
          name="title"
          autoComplete="off"
          defaultValue={noTitle ? undefined : file.title}
          className={clsx('pl-8', inputCN)}
          placeholder={placeholder}
          required={isNew}
        />
      </div>
      <button
        type='submit'
        aria-disabled={busy}
        className={`aria-disabled:opacity-75 ${buttonCN.normal} ${buttonCN.slate} ${buttonCN.iconLeft}`}
      >
        <ArrowUpTrayIcon className="w-6 h-6" />
        <p className="hidden md:block">{busy ? 'Publishing...' : 'Publish'}</p>
      </button>
      <Menu as="div" className="z-20 relative">
        {({ open }) => (
          <>
            <Menu.Button
              as="button"
              type="button"
              title="Open actions menu"
              aria-label="Open actions menu"
              className={`p-2 -ml-3 border-l border-gray-300 rounded-r-md ${buttonCN.slate}`}
            >
              <EllipsisVerticalIcon className="w-6 h-6" />
            </Menu.Button> 
            <Transition
              show={open}
              enter="transition transform duration-100 ease-out"
              enterFrom="scale-y-50 opacity-0"
              enterTo="scale-y-100 opacity-100"
              leave="transition transform duration-100 ease-out"
              leaveFrom="scale-y-100 opacity-100"
              leaveTo="scale-y-50 opacity-0">
              <Menu.Items
                static
                className="mt-2 w-72 rounded-md shadow-lg absolute top-full right-0 ring-1 ring-black ring-opacity-5">
                <div className="rounded-md text-left py-2 bg-white dark:bg-slate-600">
                  {isDraft ? (
                    <Menu.Item
                      as="button"
                      type="submit"
                      name="delete_draft"
                      value="true"
                      disabled={busy}
                      className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                    >
                      <ArrowUturnLeftIcon className="w-5 h-5" />
                      <span>Discard saved draft</span>
                    </Menu.Item>
                  ) : (
                    <>
                      <Menu.Item
                        as="button"
                        type="submit"
                        name="draft"
                        value="true"
                        disabled={!isTouched || busy || isNew}
                        className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                      >
                        <ArrowDownOnSquareStackIcon className="w-5 h-5" />
                        <span>Save draft</span>
                      </Menu.Item>
                      <Menu.Item
                        as="button"
                        type="button"
                        disabled={!isTouched || busy}
                        onClick={() => window.location.reload()}
                        className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                      >
                        <ArrowUturnLeftIcon className="w-5 h-5" />
                        <span>Discard unsaved changes</span>
                      </Menu.Item>
                    </>
                  )}
                  <Menu.Item
                    as="button"
                    type="button"
                    disabled={busy || isNew}
                    onClick={() => openModal('move')}
                    className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                  >
                    <FolderOpenIcon className="w-5 h-5" />
                    <span>Move to another collection</span>
                  </Menu.Item>
                  <Menu.Item
                    as="button"
                    type="button"
                    disabled={busy || isNew}
                    onClick={() => openModal('rename')}
                    className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                  >
                    <PencilIcon className="w-5 h-5" />
                    <span>Rename file</span>
                  </Menu.Item>
                  <Menu.Item
                    as="button"
                    type='button'
                    disabled={busy || isNew}
                    onClick={() => openModal('delete')}
                    className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.delete, buttonCN.normal)}
                  >
                    <TrashIcon className="w-5 h-5" />
                    <p>Delete file</p>
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  )
}
