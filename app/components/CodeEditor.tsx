import type { ParsedFile } from "@/lib/github"

type CodeEditorProps = {
  name: string
  file?: ParsedFile
  initialValue?: string
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
  'text-slate-700',
  'disabled:opacity-50',
  'placeholder:text-slate-300'
].concat(focusCN).join(' ')

export default function CodeEditor({ name, file, initialValue = '', onChange }: CodeEditorProps) {
  return (
    <div>
      <textarea
        name={name}
        className={`font-mono ${file?.isMarkdown ? 'whitespace-pre-line' : 'whitespace-pre'} ${inputCN}`}
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
