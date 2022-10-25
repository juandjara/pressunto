import { getBasename, getDirname } from "@/lib/pathUtils"
import { inputCN } from "@/lib/styles"
import { useParams } from "@remix-run/react"

export default function FileLabel() {
  const path = useParams()['*'] || ''
  const basename = getBasename(path)
  const folder = getDirname(path)

  return (
    <div className='flex-grow min-w-0 flex items-center text-slate-500 dark:text-slate-200 truncate'>
      <p className="text-lg font-semibold hidden md:inline md:mr-2">{folder}{'/'}</p>
      <input type="hidden" name="path" value={folder + (path === basename ? '' : '/')} />
      <input
        name="filename"
        type="text"
        defaultValue={basename}
        placeholder="file name"
        title="file name"
        aria-label="file name"
        className={inputCN}
      />
    </div>
  )
}
