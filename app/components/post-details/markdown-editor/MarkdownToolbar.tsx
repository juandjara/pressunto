import { insertBlockquote } from "@/lib/codemirror/blockquote"
import { insertBoldMarker } from "@/lib/codemirror/bold"
import { insertCodeMarker } from "@/lib/codemirror/code"
import { insertHeading } from "@/lib/codemirror/heading"
import { insertImage } from "@/lib/codemirror/imageFormat"
import { insertItalicMarker } from "@/lib/codemirror/italic"
import { insertLink } from "@/lib/codemirror/link"
import { insertUL } from "@/lib/codemirror/ul"
import { buttonCN } from "@/lib/styles"
import type { EditorView } from "@codemirror/view"
import { Menu, Transition } from "@headlessui/react"
import { CodeBracketIcon, LinkIcon, ListBulletIcon, PhotoIcon } from "@heroicons/react/20/solid"
import { useParams } from "@remix-run/react"
import { useRef } from "react"

const headingButtonCN = (flag: boolean) => [
  `p-1 w-8 h-8`,
  `text-slate-100 ${flag ? 'bg-slate-900' : 'bg-slate-600 hover:bg-slate-900'}`,
  buttonCN.common
].join(' ')

function HeadingMenu({ active, view }: { active: boolean; view: EditorView }) {
  const toggleRef = useRef<HTMLButtonElement>(null)
  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <Menu.Button
            ref={toggleRef}
            title="Open heading menu"
            className={headingButtonCN(active)}>
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
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={`heading_${n}`}
                  title={`Heading ${n}`}
                  aria-label={`Heading ${n}`}
                  type="button"
                  onClick={() => insertHeading(n, view)}
                  className={headingButtonCN(active)}>
                  H<small><strong>{n}</strong></small>
                </button>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

const iconButtonCN = (flag?: boolean) => [
  `p-1 w-8 h-8 flex justify-center items-center`,
  `font-mono text-slate-100 ${flag ? 'bg-slate-900' : 'bg-slate-600 hover:bg-slate-900'}`,
  buttonCN.common
].join(' ')

type MarkdownToolbarProps = {
  view?: EditorView
  flags: {
    isHeading: boolean
    isBold: boolean
    isItalic: boolean
  }
}

export default function MarkdownToolbar({ view, flags }: MarkdownToolbarProps) {
  const { project } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!view) {
    return null
  }

  return (
    <div
      role="toolbar" 
      className="sticky left-0 top-1 ml-2 -mb-10 z-10 flex items-center gap-2">
      <HeadingMenu active={flags.isHeading} view={view} />
      <button
        title="Bold"
        aria-label="Bold" 
        type="button"
        onClick={() => insertBoldMarker(view)}
        className={iconButtonCN(flags.isBold)}>
        <strong>B</strong>
      </button>
      <button
        title="Italic"
        aria-label="Italic" 
        type="button"
        onClick={() => insertItalicMarker(view)}
        className={iconButtonCN(flags.isItalic)}>
        <em>I</em>
      </button>
      <button
        title="Code"
        aria-label="Code"
        type="button"
        onClick={() => insertCodeMarker(view)}
        className={iconButtonCN()}>
        <CodeBracketIcon className="w-5 h-5" />
      </button>
      <button
        title="Link"
        aria-label="Link"
        type="button"
        onClick={() => insertLink(view)}
        className={iconButtonCN()}>
        <LinkIcon className="w-5 h-5" />
      </button>
      <button
        title="Blockqoute"
        aria-label="Blockqoute"
        type="button"
        onClick={() => insertBlockquote(view)}
        className={iconButtonCN()}>
        ""
      </button>
      <button
        title="List"
        aria-label="List"
        type="button"
        onClick={() => insertUL(view)}
        className={iconButtonCN()}>
        <ListBulletIcon className="w-5 h-5" />
      </button>
      <div>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={ev => ev.target.files && insertImage(view, ev.target.files[0], project!)}
        />
        <button
          title="Image"
          aria-label="Image"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={iconButtonCN()}>
          <PhotoIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
