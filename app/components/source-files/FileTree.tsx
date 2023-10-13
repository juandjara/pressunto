import { Link, useParams, useSearchParams } from '@remix-run/react'
import clsx from 'clsx'
import type { TreeItem } from '@/lib/github'
import { getBasename } from '@/lib/pathUtils'
import { FolderIcon, DocumentIcon, PlusIcon } from '@heroicons/react/24/outline'
import { iconCN } from '@/lib/styles'

function TreeItemIcon({ item }: { item: TreeItem }) {
  if (item.type === 'blob') return <DocumentIcon className={clsx('flex-shrink-0', iconCN.big)} />
  if (item.type === 'tree') return <FolderIcon className={clsx('flex-shrink-0', iconCN.big)} />
  return null
}

const LIStyle = 'dark:hover:bg-slate-600 hover:bg-gray-100 flex items-center my-1 p-2 rounded cursor-pointer'

function FileItem(f: TreeItem) {
  const file = useParams()['*']
  const linkStyle = clsx(LIStyle, { 'text-slate-600 bg-gray-100': f.path === file })
  return (
    <Link to={f.path} className={linkStyle}>
      <TreeItemIcon item={f} />
      <p className="ml-2 font-medium">{getBasename(f.path)}</p>
    </Link>
  )
}

function NewFileItem({ path }: { path: string }) {
  const file = useParams()['*']
  const linkStyle = clsx(LIStyle, { 'text-slate-600 bg-gray-100': file === `${path}/new` })
  return (
    <Link to={path ? `${path}/new` : 'new'} className={linkStyle}>
      <PlusIcon className={iconCN.big} />
      <p className='ml-2 font-medium'>New File</p>
    </Link>
  )
}

function DirItem(f: TreeItem, tree: TreeItem[]) {
  const [params] = useSearchParams()
  const pathnameFile = useParams()['*']
  const searchFile = params.get('open')
  const path = pathnameFile || searchFile
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
        <NewFileItem path={subpath || ''} />
      </li>
    </ul>
  )
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getSubTree(tree: TreeItem[], path?: string) {
  if (!path) {
    return tree
  }

  return tree.filter(f => new RegExp(`^${escapeRegex(path)}/`).test(f.path))
}

function getBaseTree(tree: TreeItem[], path?: string) {
  return tree.filter(f => {
    const part = path ? f.path.replace(new RegExp(`^${escapeRegex(path)}/`), '') : f.path
    return part.split('/').length === 1
  })
}