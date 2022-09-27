export default function FileLabel({ file }: { file: string }) {
  const basename = getBasename(file)
  const folder = file.replace(basename, '')
  return (
    <p className='text-gray-500 text-lg font-semibold'>
      <span className="hidden md:inline">{folder}</span>
      <span className="text-slate-400 font-medium">{basename}</span>
    </p>
  )
}

function getBasename(path: string) {
  return path.split('/').slice(-1)[0]
}