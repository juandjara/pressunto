import { insertBoldMarker } from "@/lib/prosemirror/bold"
import { insertItalicMarker } from "@/lib/prosemirror/italic"
import { buttonCN, inputCN } from "@/lib/styles"
import useCodeMirror from "@/lib/useCodeMirror"
import { useRef } from "react"

type CodeEditorProps = {
  name: string
  isMarkdown?: boolean
  initialValue?: string
  onChange: (s: string) => void
}

export default function MarkdownEditor({ name, initialValue = '', onChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [ref, view] = useCodeMirror(textareaRef, {
    initialValue,
    setValue: onChange
  })

  return (
    <div className="relative">
      <div
        role={"toolbar"} 
        className="absolute top-0 left-2 z-10 flex items-center gap-3 my-2">
        <button 
          type="button"
          onClick={() => view && insertBoldMarker(view)}
          className={`${buttonCN.small} ${buttonCN.slate} font-mono`}>
          <strong>B</strong>
        </button>
        <button 
          type="button"
          onClick={() => view && insertItalicMarker(view)}
          className={`${buttonCN.small} ${buttonCN.slate} font-mono`}>
          <em>I</em>
        </button>
      </div>
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
