import type { CollectionFile, ProjectConfig } from "@/lib/projects.server"
import { buttonCN } from "@/lib/styles"
import { Tab } from "@headlessui/react"
import { useLoaderData } from "@remix-run/react"
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

export default function PostEditor() {
  const { file } = useLoaderData<LoaderData>()
  const [tempContent, setTempContent] = useState('')

  useEffect(() => {
    if (file) {
      setTempContent(file.body || '')
    }
  }, [file])

  const tabButtonCN = ({ selected }: { selected: boolean }) => {
    const activeStyle = selected ? 
      `${buttonCN.cancel} border border-b-0 border-gray-300 dark:border-gray-500`
      : buttonCN.cancel

    return `${activeStyle} px-4 py-2 rounded-t-md font-medium`
  }

  return (
    <Tab.Group as="div" className='-mx-2 md:mx-0 pt-1'>
      <Tab.List className="md:mx-1.5 mb-2 flex items-center gap-2">
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
