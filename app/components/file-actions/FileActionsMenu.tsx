import type { TreeItem } from "@/lib/github"
import type { FileModalData } from "./FileActionsModal"
import { useTransition } from "@remix-run/react"
import { Menu, Transition } from "@headlessui/react"
import clsx from "clsx"
import { buttonCN } from "@/lib/styles"
import { EllipsisVerticalIcon, FolderOpenIcon, PencilIcon, TrashIcon } from "@heroicons/react/20/solid"

export default function FileActionsMenu({
  file,
  setModalData,
  wrapperCN = 'z-20 absolute top-0 left-0',
  hasGroupTransition = true,
  menuPosition = 'top-full left-0',
}: {
  file: TreeItem;
  setModalData: (data: FileModalData) => void
  wrapperCN?: string
  hasGroupTransition?: boolean
  menuPosition?: string
}) {
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  function handleMove() {
    setModalData({
      operation: 'move',
      file
    })
  }
  function handleRename() {
    setModalData({
      operation: 'rename',
      file
    })
  }
  function handleDelete() {
    setModalData({
      operation: 'delete',
      file
    })
  }

  return (
    <Menu as="div" className={wrapperCN}>
      {({ open }) => (
        <>
          <Menu.Button
            as="button"
            type="button"
            title="Open actions menu"
            aria-label="Open actions menu"
            className={
              clsx(
                buttonCN.cancel,
                'p-2 rounded-md',
                {
                  'group-hover:opacity-100 transition-opacity': hasGroupTransition,
                  'md:opacity-0': hasGroupTransition && !open
                }
              )
            }
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
              className={`w-72 rounded-md shadow-lg absolute ${menuPosition} ring-1 ring-black ring-opacity-5`}>
              <div className="rounded-md text-left py-2 bg-white dark:bg-slate-600">
                <Menu.Item
                  as="button"
                  type="button"
                  disabled={busy}
                  onClick={handleMove}
                  className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                >
                  <FolderOpenIcon className="w-5 h-5" />
                  <span>Move to another folder</span>
                </Menu.Item>
                <Menu.Item
                  as="button"
                  type="button"
                  disabled={busy}
                  onClick={handleRename}
                  className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                >
                  <PencilIcon className="w-5 h-5" />
                  <span>Rename file</span>
                </Menu.Item>
                <Menu.Item
                  as="button"
                  type='button'
                  disabled={busy}
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
  )
}
