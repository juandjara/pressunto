import { useLocation } from "@remix-run/react"

const focusCN = [
  `focus:border-rose-300`,
  'focus:ring',
  `focus:ring-rose-200`,
  'focus:ring-opacity-50',
  'focus:ring-offset-0'
].join(' ')

const inputCN = [
  'font-normal',
  'text-slate-700',
  'm-1 ml-0',
  'flex-shrink-0',
  'rounded-md',
  'border-gray-300',
  'shadow-sm',
  'disabled:opacity-50',
  'placeholder:text-slate-300',
].concat(focusCN).join(' ')

export default function FileLabel() {
  const { pathname, search } = useLocation()
  const isNew = new URLSearchParams(search).get('new') === 'true'
  const file = pathname.split('/').slice(4).join('/')
  const basename = isNew ? '' : getBasename(file)
  const folder = isNew ? `${file}/` : file.replace(basename, '')
  return (
    <p className='min-w-0 text-slate-500 dark:text-slate-200 text-lg font-semibold truncate'>
      {folder ? (
        <span className="hidden md:inline md:mr-2">{folder}</span>
      ) : null}
      <input type="hidden" name="path" value={folder} />
      <input
        name="filename"
        type="text"
        defaultValue={basename}
        placeholder="file name"
        title="file name"
        aria-label="file name"
        className={inputCN}
      />
    </p>
  )
}

function getBasename(path: string) {
  return path.split('/').slice(-1)[0]
}