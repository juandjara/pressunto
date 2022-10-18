import { inputCN } from "@/lib/styles"

type CodeEditorProps = {
  name: string
  isMarkdown?: boolean
  initialValue?: string
  onChange: (s: string) => void
}

export default function CodeEditor({ name, isMarkdown = true, initialValue = '', onChange }: CodeEditorProps) {
  return (
    <div>
      <textarea
        name={name}
        className={`font-mono ${isMarkdown ? 'whitespace-pre-line' : 'whitespace-pre'} ${inputCN}`}
        defaultValue={initialValue}
        title="file contents"
        aria-label="file contents"
        placeholder="file contents"
        onChange={ev => onChange(ev.target.value)}
        rows={20}
      />
    </div>
  )
}
