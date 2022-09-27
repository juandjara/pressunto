import type { ParsedFile } from "@/lib/github"

type CodeEditorProps = {
  file: ParsedFile
  initialValue: string
  onChange: (s: string) => void
}

const focusCN = [
  `focus:border-rose-300`,
  'focus:ring',
  `focus:ring-rose-200`,
  'focus:ring-opacity-50',
  'focus:ring-offset-0'
].join(' ')

const inputCN = [
  'w-full',
  'rounded-md',
  'border-gray-300',
  'shadow-sm',
  'disabled:opacity-50'
].concat(focusCN).join(' ')

export default function CodeEditor({ file, initialValue, onChange }: CodeEditorProps) {
  return (
    <div>
      <textarea
        name="markdown"
        className={`font-mono ${inputCN}`}
        defaultValue={initialValue}
        onChange={ev => onChange(ev.target.value)}
        rows={20}
      />
    </div>
  )
}
