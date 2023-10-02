import { borderColor, iconCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { BookOpenIcon, CodeBracketIcon, Cog6ToothIcon, DocumentDuplicateIcon, EyeSlashIcon, FolderIcon } from "@heroicons/react/20/solid"
import { NavLink } from "@remix-run/react"
import { useRef } from "react"
import { HeaderTitle } from "./Header"
import { PhotoIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"

const baseLinkCN = [
  'flex items-center gap-3 rounded-md py-1 px-2',
  'text-slate-500 dark:text-slate-200',
  'hover:bg-slate-200 hover:dark:bg-slate-600'
].join(' ')

const linkCN = ({ isActive }: { isActive: boolean }) => [
  isActive ? 'bg-slate-200 dark:bg-slate-600' : '',
  baseLinkCN
].join(' ')

export default function ProjectSidebar() {
  const { collections } = useProjectConfig()
  const summaryRef = useRef<HTMLElement>(null)

  const nav = (
    <nav>
      <ul className="space-y-2">
        <li hidden className="md:hidden flex items-center mx-1 py-3 border-t dark:border-slate-500 border-slate-300">
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
              <DocumentDuplicateIcon className={clsx('mx-0.5', iconCN.small)} />
              <span>{c.name}</span>
            </NavLink>
          </li>
        ))}
        <li className="py-3 px-1">
          <hr className={borderColor} />
        </li>
        <li>
          <NavLink to='media' className={linkCN}>
            <PhotoIcon className={iconCN.big} />
            <span className="text-lg">Media</span>
          </NavLink>
        </li>
        <li>
          <NavLink to='source' className={linkCN}>
            <CodeBracketIcon className={iconCN.big} />
            <span className="text-lg">Source</span>
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
        <details className="md:hidden bg-slate-100 dark:bg-slate-700 p-3 open:bottom-0 top-0 left-0 absolute z-30 flex-shrink-0">
          <summary ref={summaryRef} className="py-2 px-4">MENU</summary>
          <div
            style={{ width: 'calc(100vw - 24px)' }}
            className="mt-2"
            onClick={() => summaryRef.current?.click()}>
            {nav}
          </div>
        </details>
      </aside>
      <aside className="bg-slate-100 dark:bg-slate-700/50 rounded-l-md hidden md:block max-w-xs w-full flex-shrink-0 p-3">
        {nav}
      </aside>
    </>
  )
}
