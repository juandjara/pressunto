import type { CollectionFile, ProjectConfig } from "@/lib/projects.server"
import { borderColor, buttonCN } from "@/lib/styles"
import { useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import MarkdownEditor from "./markdown-editor/MarkdownEditor"
import MarkdownPreview from "./markdown-editor/MarkdownPreview"
import clsx from "clsx"
import { XMarkIcon as CloseIcon } from '@heroicons/react/20/solid'

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
              className={clsx(buttonCN.slate, buttonCN.normal)}
            >
              Preview
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

  // return (
  //   <Tab.Group
  //     as="div"
  //     className='-mx-2 md:mx-0 pt-1'
  //     style={{ flexBasis: '75ch' }}
  //     onBlur={(ev: React.FocusEvent<HTMLDivElement>) => {
  //       const isEditor = ev.target.getAttribute("contenteditable") === 'true'
  //       if (isEditor) {
  //         onDraft()
  //       }
  //     }}
  //   >
  //     <Tab.List className="md:mx-1 mb-2 flex items-center">
  //       <Tab className={tabButtonCN}>Editor</Tab>
  //       <Tab className={tabButtonCN}>Preview</Tab>
  //     </Tab.List>
  //     <Tab.Panels>
  //       <Tab.Panel>
  //         <MarkdownEditor
  //           name="markdown"
  //           initialValue={tempContent || file.body || ''}
  //           onChange={setTempContent}
  //         />
  //         {/* <p className="mx-2 mt-2 text-sm text-slate-600 dark:text-slate-300">
  //           Changes are saved automatically to your local copy. <Link className="underline" to="/doc">Learn more</Link>
  //         </p> */}
  //       </Tab.Panel>
  //       <Tab.Panel className='-mt-2'>
  //         <div className={clsx(borderColor, 'p-3 md:rounded-md border bg-white dark:bg-slate-700')}>
  //           <MarkdownPreview code={tempContent} />
  //         </div>
  //       </Tab.Panel>
  //     </Tab.Panels>
  //   </Tab.Group>
  // )
}
