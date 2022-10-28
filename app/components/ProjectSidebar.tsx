import { borderColor, buttonCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { BookOpenIcon, CodeBracketIcon, Cog6ToothIcon, DocumentDuplicateIcon, EyeSlashIcon, FolderIcon } from "@heroicons/react/20/solid"
import { NavLink } from "@remix-run/react"
import { useRef } from "react"
import { HeaderTitle } from "./Header"

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
    <nav>
      <ul className="space-y-2">
        <li className="md:hidden flex items-center mx-1 py-3 border-b border-t dark:border-slate-500 border-slate-300">
          <HeaderTitle />
        </li>
        <li>
          <NavLink to='' end className={linkCN}>
            <FolderIcon className={iconCN.big} />
            <span className="text-lg">Collections</span>
          </NavLink>
        </li>
        {collections.map((c) => (
          <li key={c.route}>
            <NavLink to={c.id} className={linkCN}>
              <DocumentDuplicateIcon className={iconCN.small} />
              <span className="ml-1">{c.name}</span>
            </NavLink>
          </li>
        ))}
        <li className="py-3"></li>
        <li>
          <NavLink to='source' className={linkCN}>
            <CodeBracketIcon className={iconCN.big} />
            <span className="text-lg">Source code</span>
          </NavLink>
        </li>
        <li>
          <NavLink to='settings' className={linkCN}>
            <Cog6ToothIcon className={iconCN.big} />
            <span className="text-lg">Settings</span>
          </NavLink>
        </li>
        <li>
          <NavLink to='/doc' className={linkCN}>
            <BookOpenIcon className={iconCN.big} />
            <span className="text-lg">Documentation</span>
          </NavLink>
        </li>
        <li>
          <NavLink to='/privacy' className={linkCN}>
            <EyeSlashIcon className={iconCN.big} />
            <span className="text-lg">Privacy</span>
          </NavLink>
        </li>
      </ul>
      </nav>
  )

  return (
    <>
      <aside>
        <details className="md:hidden dark:bg-slate-700 bg-slate-100 open:bottom-0 top-0 left-0 absolute z-30 rounded m-3 flex-shrink-0">
          <summary ref={summaryRef} className={`${buttonCN.normal} ${buttonCN.cancel}`}>MENU</summary>
          <div
            style={{ width: 'calc(100vw - 24px)' }}
            className="p-1"
            onClick={() => summaryRef.current?.click()}>
            {nav}
          </div>
        </details>
      </aside>
      <aside className="hidden md:block max-w-xs w-full flex-shrink-0 p-2 border-r border-slate-200 dark:border-gray-600">
        {nav}
      </aside>
    </>
  )
}
