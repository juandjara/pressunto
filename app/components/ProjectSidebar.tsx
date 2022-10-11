import type { ProjectCollection } from "@/lib/projects.server"
import useProjectConfig from "@/lib/useProjectConfig"
import { CodeBracketIcon, Cog6ToothIcon, DocumentDuplicateIcon, FolderIcon, PlusIcon } from "@heroicons/react/20/solid"
import { Link, NavLink } from "@remix-run/react"

const baseLinkCN = [
  'flex items-center gap-3 rounded-l-md py-1 px-2',
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

  return (
    <aside className="max-w-xs w-full flex-shrink-0 py-4 border-r border-slate-200 dark:border-gray-600">
      <nav>
        <Link to='' className={baseLinkCN}>
          <FolderIcon className={iconCN.big} />
          <span className="text-lg">Content</span>
        </Link>
        <ul className="block mt-1 space-y-2 h-full">
          {collections.map((c) => (
            <li key={c.route}>
              <NavLink to={c.id} className={linkCN}>
                <DocumentDuplicateIcon className={iconCN.small} />
                <span>{c.name}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <Link to='new' className={baseLinkCN}>
              <PlusIcon className={iconCN.big} />
              <span>New collection</span>
            </Link>
          </li>
        </ul>
      </nav>
      <nav className="space-y-2 mt-12">
        <NavLink to='rawsite' className={linkCN}>
          <CodeBracketIcon className={iconCN.big} />
          <span className="text-lg">Raw Site</span>
        </NavLink>
        <NavLink to='settings' className={linkCN}>
          <Cog6ToothIcon className={iconCN.big} />
          <span className="text-lg">Settings</span>
        </NavLink>
      </nav>
    </aside>
  )
}
