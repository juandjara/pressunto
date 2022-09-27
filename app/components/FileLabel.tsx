const focusCN = [
  `focus:border-rose-300`,
  'focus:ring',
  `focus:ring-rose-200`,
  'focus:ring-opacity-50',
  'focus:ring-offset-0'
].join(' ')

const inputCN = [
  'font-normal',
  'text-gray-700',
  'm-1 md:ml-2',
  'flex-shrink-0',
  'rounded-md',
  'border-gray-300',
  'shadow-sm',
  'disabled:opacity-50'
].concat(focusCN).join(' ')

export default function FileLabel({ file }: { file: string }) {
  const basename = getBasename(file)
  const folder = file.replace(basename, '')
  return (
    <p className='text-slate-500 text-lg font-semibold truncate'>
      <span className="hidden md:inline">{folder}</span>
      <input
        name="filename"
        type="text"
        defaultValue={basename}
        placeholder="File name"
        className={inputCN}
      />
      {/* <span className="text-slate-400 font-medium">{basename}</span> */}
    </p>
  )
}

function getBasename(path: string) {
  return path.split('/').slice(-1)[0]
}