import { inputCN } from "@/lib/styles"

type FileEditorProps = {
  name: string
  isMarkdown?: boolean
  initialValue?: string
  onChange: (s: string) => void
}

export default function FileEditor({ name, isMarkdown = true, initialValue = '', onChange }: FileEditorProps) {
  return (
    <div>
      <textarea
        name={name}
        className={`font-mono ${isMarkdown ? 'whitespace-pre-line' : 'whitespace-pre'} ${inputCN}`}
        defaultValue={initialValue}
        title="file contents"
        aria-label="file contents"
        placeholder="...here goes something"
        onChange={ev => onChange(ev.target.value)}
        rows={20}
      />
    </div>
  )
}
