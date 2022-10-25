import { buttonCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { BookOpenIcon, CodeBracketIcon, Cog6ToothIcon, DocumentDuplicateIcon, EyeSlashIcon, FolderIcon } from "@heroicons/react/20/solid"
import { NavLink } from "@remix-run/react"
import { useRef } from "react"

const baseLinkCN = [
  'flex items-center gap-3 rounded-md py-1 px-2',
  'text-slate-500 dark:text-slate-200',
  'hover:bg-slate-100 hover:dark:bg-slate-700'
].join(' ')

const linkCN = ({ isActive }: { isActive: boolean }) => [
  isActive ? 'bg-slate-100 dark:bg-slate-700' : '',
  baseLinkCN
].join(' ')

const iconColor = 'text-slate-500 dark:text-slate-300'
const iconCN = {
  big: `w-6 h-6 ${iconColor}`,
  small: `w-5 h-5 ${iconColor}`,
}

export default function ProjectSidebar() {
  const { collections } = useProjectConfig()
  const summaryRef = useRef<HTMLElement>(null)

  const nav = (
    <>
      <nav>
        <NavLink to='' end className={linkCN}>
          <FolderIcon className={iconCN.big} />
          <span className="text-lg">Collections</span>
        </NavLink>
        <ul className="block ml-0.5 my-2 space-y-2 h-full">
          {collections.map((c) => (
            <li key={c.route}>
              <NavLink to={c.id} className={linkCN}>
                <DocumentDuplicateIcon className={iconCN.small} />
                <span className="ml-1">{c.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <nav className="space-y-2 mt-12">
        <NavLink to='source' className={linkCN}>
          <CodeBracketIcon className={iconCN.big} />
          <span className="text-lg">Source code</span>
        </NavLink>
        <NavLink to='settings' className={linkCN}>
          <Cog6ToothIcon className={iconCN.big} />
          <span className="text-lg">Settings</span>
        </NavLink>
        <NavLink to='/privacy' className={linkCN}>
          <EyeSlashIcon className={iconCN.big} />
          <span>Privacy</span>
        </NavLink>
        <NavLink to='/doc' className={linkCN}>
          <BookOpenIcon className={iconCN.big} />
          <span>Documentation</span>
        </NavLink>
      </nav>
    </>
  )

  return (
    <aside className="md:max-w-xs w-full flex-shrink-0 px-2 py-2 md:py-4 border-r border-slate-200 dark:border-gray-600">
      <details className="md:hidden">
        <summary ref={summaryRef} className={`${buttonCN.normal} ${buttonCN.cancel}`}>MENU</summary>
        <div onClick={() => summaryRef.current?.click()}>
          {nav}
        </div>
      </details>
      <div className="hidden md:block">{nav}</div>
    </aside>
  )
}
