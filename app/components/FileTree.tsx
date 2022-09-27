import { useSearchParams } from '@remix-run/react'
import clsx from 'clsx'
import type { TreeItem } from '@/lib/github'

function DocumentIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  )
}

function FolderIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  )
}

function TreeItemIcon({ item, ...props }: { item: TreeItem; className?: string }) {
  if (item.type === 'blob') return <DocumentIcon {...props} />
  if (item.type === 'tree') return <FolderIcon {...props} />
  return null
}

const LIStyle = 'hover:bg-gray-100 flex items-center p-2 rounded cursor-pointer'

function FileItem(f: TreeItem) {
  const [searchParams] = useSearchParams()

  const linkStyle = clsx(LIStyle, { 'bg-gray-100': f.path === searchParams.get('file') })
  return (
    <a href={`?file=${f.path}`} className={linkStyle}>
      <TreeItemIcon item={f} className="p-2 bg-gray-100" />
      <p className="ml-2 font-medium">{getBasename(f.path)}</p>
    </a>
  )
}

function NewFileItem({ path }: { path: string }) {
  return (
    <a href={`?file=${path}&new=true`} className={LIStyle}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <p className='ml-2 font-medium'>New File</p>
    </a>
  )
}

function DirItem(f: TreeItem, tree: TreeItem[]) {
  return (
    <details>
      <summary className={LIStyle}>
        <TreeItemIcon item={f} className="p-2 bg-gray-100" />
        <p className="ml-2 font-medium">{getBasename(f.path)}</p>
      </summary>
      <div className="pl-4">
        <FileTree tree={tree} subpath={f.path} />
      </div>
    </details>
  )
}

export default function FileTree({ tree, subpath }: { tree: TreeItem[]; subpath?: string }) {
  return (
    <ul>
      {getBaseTree(getSubTree(tree, subpath), subpath).map(f => (
        <li key={f.path}>
          {f.type === 'blob' && FileItem(f)}
          {f.type === 'tree' && DirItem(f, tree)}
        </li>
      ))}
      <li>
        <NewFileItem path="/" />
      </li>
    </ul>
  )
}

function getBasename(path: string) {
  return path.split('/').slice(-1)[0]
}

function getSubTree(tree: TreeItem[], path?: string) {
  if (!path) {
    return tree
  }

  return tree.filter(f => new RegExp(`^${path}/`).test(f.path))
}

function getBaseTree(tree: TreeItem[], path?: string) {
  return tree.filter(f => {
    const part = path ? f.path.replace(new RegExp(`^${path}/`), '') : f.path
    return part.split('/').length === 1
  })
}