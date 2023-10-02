import type { CollectionFile, ProjectConfig } from "@/lib/projects.server"
import { borderColor, buttonCN } from "@/lib/styles"
import { useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import MarkdownEditor from "./markdown-editor/MarkdownEditor"
import MarkdownPreview from "./markdown-editor/MarkdownPreview"
import clsx from "clsx"
import { XMarkIcon as CloseIcon } from '@heroicons/react/20/solid'
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline"

type LoaderData = {
  file: CollectionFile,
  config: ProjectConfig,
  permissions: {
    admin: boolean
    push: boolean
    pull: boolean
  }
}

export default function PostEditor({ onDraft }: { onDraft: () => void }) {
  const { file } = useLoaderData<LoaderData>()
  const [tempContent, setTempContent] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (file) {
      setTempContent(file.body || '')
    }
  }, [file])

  return (
    <div
      className="-mx-2 md:mx-0 pt-1 basis-[75ch]"
      onBlur={(ev: React.FocusEvent<HTMLDivElement>) => {
        const isEditor = ev.target.getAttribute("contenteditable") === 'true'
        if (isEditor) {
          onDraft()
        }
      }}
    >
      {preview ? (
        <>
          <div className="flex items-center mb-4 md:pr-0 pr-2">
            <p className="font-medium pl-2 text-xl text-slate-600 dark:text-slate-200 flex-grow">
              Preview
            </p>
            <button
              type="button"
              onClick={() => setPreview(false)}
              aria-label="Close preview"
              title="Close preview"
              className={clsx(buttonCN.normal, buttonCN.cancel, buttonCN.icon)}
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className={clsx(borderColor, '-mt-2 p-3 md:rounded-md border bg-white dark:bg-slate-700')}>
            <MarkdownPreview code={tempContent} />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-4 md:pr-0 pr-2">
            <p className="font-medium pl-2 text-xl text-slate-600 dark:text-slate-200 flex-grow">
              Editor
            </p>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={clsx(buttonCN.slate, buttonCN.normal, buttonCN.iconLeft)}
            >
              <DocumentMagnifyingGlassIcon className="w-6 h-6" />
              <p>Preview</p>
            </button>
          </div>
          <MarkdownEditor
            name="markdown"
            initialValue={tempContent || file.body || ''}
            onChange={setTempContent}
          />
        </>
      )}
    </div>
  )
}
