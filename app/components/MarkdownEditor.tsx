import { insertBoldMarker } from "@/lib/codemirror/bold"
import { insertItalicMarker } from "@/lib/codemirror/italic"
import { buttonCN, inputCN } from "@/lib/styles"
import useCodeMirror from "@/lib/codemirror/useCodeMirror"
import { useRef } from "react"
import { insertCodeMarker } from "@/lib/codemirror/code"
import { insertHeading } from "@/lib/codemirror/heading"
import { ChevronRightIcon, CodeBracketIcon, LinkIcon, ListBulletIcon } from "@heroicons/react/20/solid"
import { insertLink } from "@/lib/codemirror/link"
import { insertBlockquote } from "@/lib/codemirror/blockquote"
import { insertUL } from "@/lib/codemirror/ul"
import { Menu, Transition } from "@headlessui/react"
import { EditorView } from "@codemirror/view"

type CodeEditorProps = {
  name: string
  isMarkdown?: boolean
  initialValue?: string
  onChange: (s: string) => void
}

/*

*/

function HeadingMenu({ view }: { view: EditorView }) {
  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            title="Open heading menu"
            className={`w-9 text-lg ${buttonCN.small} ${buttonCN.slate}`}>
            <strong>H</strong>
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
              className="py-2 space-y-2 absolute left-0 top-full ring-1 ring-black ring-opacity-5">
              <button
                title="Heading 1"
                aria-label="Heading 1"
                type="button"
                onClick={() => view && insertHeading(1, view)}
                className={`w-9 text-lg ${buttonCN.small} ${buttonCN.slate} font-mono`}>
                H<small><strong>1</strong></small>
              </button>
              <button
                title="Heading 2"
                aria-label="Heading 2"
                type="button"
                onClick={() => view && insertHeading(2, view)}
                className={`w-9 text-lg ${buttonCN.small} ${buttonCN.slate} font-mono`}>
                H<small><strong>2</strong></small>
              </button>
              <button
                title="Heading 3"
                aria-label="Heading 3"
                type="button"
                onClick={() => view && insertHeading(3, view)}
                className={`w-9 text-lg ${buttonCN.small} ${buttonCN.slate} font-mono`}>
                H<small><strong>3</strong></small>
              </button>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default function MarkdownEditor({ name, initialValue = '', onChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [ref, view] = useCodeMirror(textareaRef, {
    initialValue,
    setValue: onChange
  })

  return (
    <div className="relative">
      {view ? (
        <div
          role={"toolbar"} 
          className="absolute top-0 left-2 z-10 flex items-center gap-2 my-2">
          <HeadingMenu view={view} />
          <button
            title="Bold"
            aria-label="Bold" 
            type="button"
            onClick={() => insertBoldMarker(view)}
            className={`w-9 ${buttonCN.small} ${buttonCN.slate}`}>
            <strong>B</strong>
          </button>
          <button
            title="Italic"
            aria-label="Italic" 
            type="button"
            onClick={() => insertItalicMarker(view)}
            className={`w-9 ${buttonCN.small} ${buttonCN.slate} font-mono`}>
            <em>I</em>
          </button>
          <button
            title="Code"
            aria-label="Code"
            type="button"
            onClick={() => insertCodeMarker(view)}
            className={`w-9 ${buttonCN.small} ${buttonCN.slate}`}>
            <CodeBracketIcon className="w-5 h-5" />
          </button>
          <button
            title="Link"
            aria-label="Link"
            type="button"
            onClick={() => insertLink(view)}
            className={`w-9 ${buttonCN.small} ${buttonCN.slate}`}>
            <LinkIcon className="w-5 h-5" />
          </button>
          <button
            title="Blockqoute"
            aria-label="Blockqoute"
            type="button"
            onClick={() => insertBlockquote(view)}
            className={`w-9 ${buttonCN.small} ${buttonCN.slate} font-mono`}>
            ""
          </button>
          <button
            title="List"
            aria-label="List"
            type="button"
            onClick={() => insertUL(view)}
            className={`w-9 ${buttonCN.small} ${buttonCN.slate}`}>
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      ) : null}
      <div ref={ref} className="border border-gray-300 dark:border-gray-500 rounded-md"></div>
      <textarea
        ref={textareaRef}
        name={name}
        value={initialValue}
        className={`font-mono whitespace-pre-line ${inputCN}`}
        readOnly
        title="file contents"
        aria-label="file contents"
        placeholder="file contents"
        rows={20}
      />
    </div>
  )
}
