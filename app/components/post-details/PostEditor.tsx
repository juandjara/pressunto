import type { CollectionFile, ProjectConfig } from "@/lib/projects.server"
import { borderColor } from "@/lib/styles"
import { Tab } from "@headlessui/react"
import { Link, useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import MarkdownEditor from "./markdown-editor/MarkdownEditor"
import MarkdownPreview from "./markdown-editor/MarkdownPreview"

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

  useEffect(() => {
    if (file) {
      setTempContent(file.body || '')
    }
  }, [file])

  const tabButtonCN = ({ selected }: { selected: boolean }) => {
    const activeStyle = selected
      ? 'text-slate-100 bg-slate-600 hover:bg-slate-700'
      : 'hover:bg-slate-100 dark:hover:bg-slate-100/25'

    return [
      activeStyle,
      'px-4 py-2 font-medium w-24',
      'first:rounded-tl-md last:rounded-tr-md',
      'boder-b-0 border-t first:border-l first:border-r last:border-r',
      borderColor
    ].join(' ')
  }

  return (
    <Tab.Group
      as="div"
      className='-mx-2 md:mx-0 pt-1'
      style={{ flexBasis: '75ch' }}
      onBlur={(ev: React.FocusEvent<HTMLDivElement>) => {
        const isEditor = ev.target.getAttribute("contenteditable") === 'true'
        if (isEditor) {
          onDraft()
        }
      }}
    >
      <Tab.List className="md:mx-1 mb-2 flex items-center">
        <Tab className={tabButtonCN}>Editor</Tab>
        <Tab className={tabButtonCN}>Preview</Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <MarkdownEditor
            name="markdown"
            initialValue={tempContent || file.body || ''}
            onChange={setTempContent}
          />
          {/* <p className="mx-2 mt-2 text-sm text-slate-600 dark:text-slate-300">
            Changes are saved automatically to your local copy. <Link className="underline" to="/doc">Learn more</Link>
          </p> */}
        </Tab.Panel>
        <Tab.Panel className='-mt-2'>
          <div className='p-3 md:rounded-md border border-gray-300'>
            <MarkdownPreview code={tempContent} />
          </div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  )
}
