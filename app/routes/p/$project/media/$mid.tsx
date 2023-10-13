import FileActionsMenu from "@/components/file-actions/FileActionsMenu"
import type { FileModalData } from "@/components/file-actions/FileActionsModal"
import FileActionsModal from "@/components/file-actions/FileActionsModal"
import { borderColor, buttonCN, iconCN } from "@/lib/styles"
import { useProject, useRepoTree } from "@/lib/useProjectConfig"
import { XMarkIcon } from "@heroicons/react/20/solid"
import { PhotoIcon } from "@heroicons/react/24/outline"
import { Link, useParams } from "@remix-run/react"
import clsx from "clsx"
import { useState } from "react"

export default function MediaDetails() {
  const { mid } = useParams()
  const { branch, repo } = useProject()
  const tree = useRepoTree()
  const folders = tree.filter(t => t.type === 'tree')
  const file = tree.find((t) => t.sha === mid)
  const baseURL = `https://raw.githubusercontent.com/${repo}/${branch}/`
  const [modalData, setModalData] = useState<FileModalData | null>(null)

  if (!file) {
    return null
  }

  return (
    <div className={clsx(borderColor, 'border rounded-lg relative my-8')}>
      <Link
        to='..'
        className={clsx('absolute top-2 right-2 p-1', 'bg-slate-100 dark:bg-slate-100/25', buttonCN.common)}
      >
        <XMarkIcon className="w-5 h-5" />
      </Link>
      <figure>
        <img className="block mx-auto rounded-t-lg" src={`${baseURL}/${file?.path}`} alt={file?.path} />
        <figcaption className={clsx(borderColor, 'border-t rounded-b-lg p-2 pl-3 relative flex items-center gap-3 bg-slate-100 dark:bg-slate-700')}>
          <PhotoIcon className={clsx('flex-shrink-0', iconCN.big)} />
          <p className="flex-grow text-lg text-slate-700 dark:text-slate-100">{file.path}</p>
          <FileActionsMenu
            file={file}
            setModalData={setModalData}
            hasGroupTransition={false}
            wrapperCN="relative"
            menuPosition="bottom-full right-0 mb-12"
          />
        </figcaption>
      </figure>
      {modalData && (
        <FileActionsModal 
          folders={folders}
          modalData={modalData}
          onClose={() => setModalData(null)}
          redirectTarget="media"
        />
      )}
    </div>
  )
}
