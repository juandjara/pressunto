import type { TreeItem } from "@/lib/github"
import { useFetcher, useParams } from "@remix-run/react"
import Modal from "../Modal"
import { ComboBoxLocal } from "../ComboBoxLocal"
import { buttonCN, inputCN, labelCN } from "@/lib/styles"
import { getBasename, getDirname } from "@/lib/pathUtils"
import clsx from "clsx"
import { useEffect } from "react"

const modalTitle = {
  move: 'Move file to another folder',
  rename: 'Rename file',
  delete: 'Delete file'
}
const modalConfirmLabel = {
  move: 'Move',
  rename: 'Rename',
  delete: 'Delete'
}
const modalBusyLabel = {
  move: 'Moving...',
  rename: 'Renaming...',
  delete: 'Deleting...'
}

export type FileModalData = {
  operation: 'move' | 'rename' | 'delete'
  file: TreeItem
}

export default function FileActionsModal({
  modalData,
  onClose,
  folders
}: {
  modalData: FileModalData
  onClose: () => void
  folders: TreeItem[]
}) {
  const { project } = useParams()
  const actionURL = `/api/files/${project}`
  const fetcher = useFetcher()
  const busy = fetcher.state !== 'idle'

  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle')  {
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher])

  return (
    <Modal open onClose={onClose} title={modalTitle[modalData.operation]}>
      <fetcher.Form action={actionURL} replace method={modalData.operation === 'delete' ? 'delete' : 'put'}>
        <input type="hidden" name="sha" value={modalData.file.sha} />
        <input type="hidden" name="path" value={modalData.file.path} />
        {modalData?.operation === 'move' && (
          <div>
            <label htmlFor="folder" className={labelCN}>New folder for the file</label>
            <ComboBoxLocal<TreeItem>
              name='folder'
              options={folders}
              labelKey='path'
              valueKey='path'
              defaultValue={getDirname(modalData.file.path)}
            />
          </div>
        )}
        {modalData?.operation === 'rename' && (
          <div className="my-4">
            <label htmlFor="name" className={labelCN}>New name for the file</label>
            <input
              required
              type="text"
              name="name"
              defaultValue={getBasename(modalData.file.path)}
              className={inputCN}
            />
          </div>
        )}
        {modalData?.operation === 'delete' && (
          <div>
            <p className="text-slate-600 dark:text-slate-200 text-lg max-w-prose my-4">
              Are you sure you want to delete the file <code>{modalData.file.path}</code> ?
            </p>
          </div>
        )}
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className={`${buttonCN.normal} ml-3 hover:bg-slate-100 dark:hover:bg-slate-100/25`}>
            Cancel
          </button>
          <button
            type="submit"
            name="operation"
            value={modalData.operation}
            disabled={busy}
            className={
              clsx({
                [buttonCN.slate]: modalData.operation !== 'delete',
                [buttonCN.deleteBold]: modalData.operation === 'delete'
              }, buttonCN.normal)
            }>
            {busy ? modalBusyLabel[modalData.operation] : modalConfirmLabel[modalData.operation]}
          </button>
        </div>
      </fetcher.Form>
    </Modal>
  )
}
