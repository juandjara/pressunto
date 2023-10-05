import type { CollectionFile } from "@/lib/projects.server"
import { buttonCN, iconCN, inputCN } from "@/lib/styles"
import { useNavigate, useParams, useTransition } from "@remix-run/react"
import { ArrowLeftIcon, ArrowUpTrayIcon, ArrowUturnLeftIcon, DocumentIcon, FolderOpenIcon, TrashIcon } from "@heroicons/react/24/outline"
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid"
import { Menu, Transition } from "@headlessui/react"
import clsx from "clsx"
import { getBasename } from "@/lib/pathUtils"

export default function PostDetailsHeader({ file, isDraft }: { file: CollectionFile, isDraft: boolean }) {
  const transition = useTransition()
  const busy = transition.state === 'submitting'
  const navigate = useNavigate()
  const { project, cid, pid } = useParams()
  const backLink = `/p/${project}/${cid}`
  const isNew = pid === 'new'

  function handleDelete(ev: React.MouseEvent) {
    const isDelete = (ev.target as HTMLButtonElement).value === 'delete'
    if (isDelete && !window.confirm('¿Are you sure you want to delete this post?')) {
      ev.preventDefault()
    }
  }

  return (
    <div className="mb-2 flex items-center gap-2">
      <button
        onClick={() => navigate(backLink)}
        title="Back"
        aria-label="Back"
        type="button"
        className={`${buttonCN.normal} ${buttonCN.icon} ${buttonCN.cancel}`}>
        <ArrowLeftIcon className='w-5 h-5' />
      </button>
      <div className="relative flex-grow">
        <DocumentIcon className={clsx(iconCN.small, 'absolute top-[11px] left-2')} />
        <input
          type="text"
          placeholder="file name"
          className={`pl-9 ${inputCN}`}
          name="name"
          defaultValue={isNew ? '' : getBasename(file.path)}
          readOnly
        />
      </div>
      <button
        type='submit'
        name='_op'
        value='save'
        disabled={!isDraft || busy}
        className={`disabled:opacity-75 ${buttonCN.normal} ${buttonCN.slate} ${buttonCN.iconLeft}`}
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
                  <Menu.Item
                    as="button"
                    type="button"
                    disabled={busy || isNew}
                    className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                  >
                    <FolderOpenIcon className="w-5 h-5" />
                    <span>Move to another collection</span>
                  </Menu.Item>
                  <Menu.Item
                    as="button"
                    type="button"
                    disabled={!isDraft || busy}
                    onClick={() => window.location.reload()}
                    className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                  >
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                    <span>Discard unsaved changes</span>
                  </Menu.Item>
                  <Menu.Item
                    as="button"
                    type='submit'
                    name='_op'
                    value='delete'
                    disabled={busy || isNew}
                    onClick={handleDelete}
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
