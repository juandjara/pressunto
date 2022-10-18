import { Link, useLocation, useParams } from '@remix-run/react'
import clsx from 'clsx'
import type { TreeItem } from '@/lib/github'

function DocumentIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`w-6 h-6 ${className}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  )
}

function FolderIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`w-6 h-6 ${className}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  )
}

function TreeItemIcon({ item }: { item: TreeItem }) {
  if (item.type === 'blob') return <DocumentIcon className="flex-shrink-0 text-slate-400" />
  if (item.type === 'tree') return <FolderIcon className="flex-shrink-0 text-slate-400" />
  return null
}

const LIStyle = 'hover:text-slate-600 hover:bg-gray-100 flex items-center my-1 p-2 rounded cursor-pointer'

function useBasePath() {
  const { org, repo } = useParams()
  return `/r/${org}/${repo}`
}

function FileItem(f: TreeItem) {
  const file = useParams()['*']
  const base = useBasePath()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  params.delete('new')

  const linkStyle = clsx(LIStyle, { 'text-slate-600 bg-gray-100': f.path === file })
  return (
    <Link to={`${base}/${f.path}?${params}`} className={linkStyle}>
      <TreeItemIcon item={f} />
      <p className="ml-2 font-medium">{getBasename(f.path)}</p>
    </Link>
  )
}

function NewFileItem({ path }: { path: string }) {
  const base = useBasePath()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  params.set('new', 'true')

  return (
    <Link to={`${base}${path}?${params}`} className={LIStyle}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <p className='ml-2 font-medium'>New File</p>
    </Link>
  )
}

function DirItem(f: TreeItem, tree: TreeItem[]) {
  const path = useParams()['*']
  const isOpen = !!path && path.startsWith(f.path)
  return (
    <details open={isOpen}>
      <summary className={LIStyle}>
        <TreeItemIcon item={f} />
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
        <NewFileItem path={`/${subpath || ''}`} />
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