import { inputCN } from "@/lib/styles"
import useCodeMirror from "@/lib/codemirror/useCodeMirror"
import { useRef } from "react"
import MarkdownToolbar from "./MarkdownToolbar"

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
      <MarkdownToolbar view={view} />
      <div ref={ref} className="border border-gray-300 dark:border-gray-500 md:rounded-md"></div>
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
