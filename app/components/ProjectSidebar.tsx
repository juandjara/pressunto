import type { Collection } from "@/lib/projects.server"
import { CodeBracketIcon, Cog6ToothIcon, DocumentDuplicateIcon, FolderIcon, PlusIcon } from "@heroicons/react/20/solid"
import { Link } from "@remix-run/react"

const linkCN = [
  'flex items-center gap-3 rounded-md mx-2 py-1 px-1',
  'hover:bg-slate-100 hover:dark:bg-slate-700'
].join(' ')

const iconColor = 'text-slate-500 dark:text-slate-300'
const iconCN = {
  big: `w-6 h-6 ${iconColor}`,
  small: `w-5 h-5 ${iconColor}`,
}

export default function ProjectSidebar({ collections }: { collections: Collection[] }) {
  return (
    <aside className="max-w-sm w-full flex-shrink-0 py-2 my-4 bg-slate-50">
      <nav>
        <p className={linkCN}>
          <FolderIcon className={iconCN.big} />
          <span className="text-lg">Content</span>
        </p>
        <ul className="block mt-1 pl-1 space-y-1 h-full">
          {collections.map((c) => (
            <li key={c.id}>
              <Link to={`./c/${c.id}`} className={`${linkCN} ml-1`}>
                <DocumentDuplicateIcon className={iconCN.small} />
                <span>{c.name}</span>
              </Link>  
            </li>
          ))}
          <li>
            <Link to='./c/new' className={`${linkCN} ml-1`}>
              <PlusIcon className={iconCN.big} />
              <span>New collection</span>
            </Link>
          </li>
          {/* <li>
            <Link to='' className={linkCN}>
              <DocumentDuplicateIcon className={iconCN.small} />
              <span>Posts</span>
            </Link>
          </li>
          <li>
            <Link to='' className={linkCN}>
              <DocumentDuplicateIcon className={iconCN.small} />
              <span>Pages</span>
            </Link>
          </li>
          <li>
            <Link to='' className={linkCN}>
              <DocumentDuplicateIcon className={iconCN.small} />
              <span>Drafts</span>
            </Link>
          </li>
          <li>
            <Link to='' className={linkCN}>
              <PlusIcon className={iconCN.big} />
              <span>New collection</span>
            </Link>
          </li> */}
        </ul>
      </nav>
      <nav className="space-y-1 mt-12">
        <Link to='./rawsite' className={linkCN}>
          <CodeBracketIcon className={iconCN.big} />
          <span className="text-lg">Raw Site</span>
        </Link>
        <Link to='./settings' className={linkCN}>
          <Cog6ToothIcon className={iconCN.big} />
          <span className="text-lg">Settings</span>
        </Link>
      </nav>
    </aside>
  )
}
