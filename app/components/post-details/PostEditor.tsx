import type { CollectionFile, ProjectConfig } from "@/lib/projects.server"
import { borderColor, buttonCN } from "@/lib/styles"
import { useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import MarkdownEditor from "./markdown-editor/MarkdownEditor"
import MarkdownPreview from "./markdown-editor/MarkdownPreview"
import clsx from "clsx"
import { ArrowLeftIcon, DocumentMagnifyingGlassIcon , ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/react/24/outline"
import type { Permissions } from "@/lib/github"

type LoaderData = {
  file: CollectionFile,
  config: ProjectConfig,
  permissions: Permissions
}

export default function PostEditor({
  onDraft,
  onToggle,
  expanded
}: {
  onDraft: () => void;
  onToggle: () => void
  expanded: boolean
}) {
  const { file } = useLoaderData<LoaderData>()
  const [tempContent, setTempContent] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (file) {
      setTempContent(file.body || '')
    }
  }, [file])

  const ExpandIcon = expanded ? ArrowsPointingInIcon : ArrowsPointingOutIcon

  return (
    <div
      className={clsx('-mx-2 md:mx-0 pt-1', { 'basis-[75ch]': !expanded, 'w-full': expanded })}
      onBlur={(ev: React.FocusEvent<HTMLDivElement>) => {
        const isEditor = ev.target.getAttribute("contenteditable") === 'true'
        if (isEditor) {
          onDraft()
        }
      }}
    >
      {preview ? (
        <>
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={clsx(buttonCN.normal, buttonCN.cancel, buttonCN.iconLeft)}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <p>Back</p>
          </button>
          <div className={clsx(borderColor, 'p-3 mt-2 md:rounded-md border bg-white dark:bg-slate-700')}>
            <MarkdownPreview code={tempContent} />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-4 md:pr-0 pr-2 gap-2">
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
            <button
              type="button"
              onClick={onToggle}
              title={expanded ? 'Collapse post editor' : 'Expand post editor'}
              aria-label={expanded ? 'Collapse post editor' : 'Expand post editor'}
              className={clsx('hidden md:flex', buttonCN.icon, buttonCN.normal, buttonCN.slate)}
            >
              <ExpandIcon className='h-6 w-6' />
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
