import { insertBlockquote } from "@/lib/codemirror/blockquote"
import { insertBoldMarker } from "@/lib/codemirror/bold"
import { insertCodeMarker } from "@/lib/codemirror/code"
import { insertHeading } from "@/lib/codemirror/heading"
import { insertItalicMarker } from "@/lib/codemirror/italic"
import { insertLink } from "@/lib/codemirror/link"
import { insertUL } from "@/lib/codemirror/ul"
import { buttonCN } from "@/lib/styles"
import type { EditorView } from "@codemirror/view"
import { Menu, Transition } from "@headlessui/react"
import { CodeBracketIcon, LinkIcon, ListBulletIcon } from "@heroicons/react/20/solid"
import { useRef } from "react"

const headingButtonCN = [
  `p-1 w-8 h-8`,
  `text-slate-100 bg-slate-600 hover:bg-slate-900`,
  buttonCN.common
].join(' ')

function HeadingMenu({ view }: { view: EditorView }) {
  const toggleRef = useRef<HTMLButtonElement>(null)
  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            ref={toggleRef}
            title="Open heading menu"
            className={headingButtonCN}>
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
              onClick={() => toggleRef.current?.click()}
              className="py-2 space-y-2 absolute left-0 top-full ring-1 ring-black ring-opacity-5">
              <button
                title="Heading 1"
                aria-label="Heading 1"
                type="button"
                onClick={() => insertHeading(1, view)}
                className={headingButtonCN}>
                H<small><strong>1</strong></small>
              </button>
              <button
                title="Heading 2"
                aria-label="Heading 2"
                type="button"
                onClick={() => insertHeading(2, view)}
                className={headingButtonCN}>
                H<small><strong>2</strong></small>
              </button>
              <button
                title="Heading 3"
                aria-label="Heading 3"
                type="button"
                onClick={() => insertHeading(3, view)}
                className={headingButtonCN}>
                H<small><strong>3</strong></small>
              </button>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

const iconButtonCN = [
  `p-1 w-8 h-8 flex justify-center items-center`,
  `font-mono text-slate-100 bg-slate-600 hover:bg-slate-900`,
  buttonCN.common
].join(' ')

export default function MarkdownToolbar({ view }: { view?: EditorView }) {
  if (!view) {
    return null
  }

  return (
    <div
      role="toolbar" 
      className="sticky left-0 top-1 ml-2 -mb-10 z-10 flex items-center gap-2">
      <HeadingMenu view={view} />
      <button
        title="Bold"
        aria-label="Bold" 
        type="button"
        onClick={() => insertBoldMarker(view)}
        className={iconButtonCN}>
        <strong>B</strong>
      </button>
      <button
        title="Italic"
        aria-label="Italic" 
        type="button"
        onClick={() => insertItalicMarker(view)}
        className={iconButtonCN}>
        <em>I</em>
      </button>
      <button
        title="Code"
        aria-label="Code"
        type="button"
        onClick={() => insertCodeMarker(view)}
        className={iconButtonCN}>
        <CodeBracketIcon className="w-5 h-5" />
      </button>
      <button
        title="Link"
        aria-label="Link"
        type="button"
        onClick={() => insertLink(view)}
        className={iconButtonCN}>
        <LinkIcon className="w-5 h-5" />
      </button>
      <button
        title="Blockqoute"
        aria-label="Blockqoute"
        type="button"
        onClick={() => insertBlockquote(view)}
        className={iconButtonCN}>
        ""
      </button>
      <button
        title="List"
        aria-label="List"
        type="button"
        onClick={() => insertUL(view)}
        className={iconButtonCN}>
        <ListBulletIcon className="w-5 h-5" />
      </button>
    </div>
  )
}
