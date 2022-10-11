import type { TreeItem } from "@/lib/github"
import { getRepoFiles, isMarkdown } from "@/lib/github"
import type { ProjectCollection } from "@/lib/projects.server"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { forwardRef, useState } from "react"
import { CSS } from '@dnd-kit/utilities'

function getDirname(path: string) {
  return path.split('/').slice(0, -1).join('/')
}

function getBasename(path: string) {
  return path.split('/').slice(-1)[0]
}

type LoaderData = {
  files: (TreeItem & { id: string })[]
  collection: ProjectCollection
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const { token, user } = await requireUserSession(request)
  const collectionId = params.cid
  const repo = `${params.org}/${params.repo}`
  
  const project = await getProject(user.name, repo)
  const config = await getProjectConfig(token, project)
  const collection = config.collections.find((c) => c.id === collectionId)
  if (!collection) {
    throw new Response(`Collection "${collectionId}" not found`, { status: 404, statusText: 'Not found' })
  }

  const tree = await getRepoFiles(token, project.repo, project.branch || 'master')
  const files = tree.filter((f) => {
    const inCollection = getDirname(f.path) === collection.route.replace(/^\//, '')
    return inCollection && isMarkdown(f.path)
  }).map((f) => ({
    ...f,
    id: f.sha
  }))

  return json<LoaderData>({ files, collection })
}

const listCN = 'flex items-center pl-4 p-2 rounded-md text-lg bg-slate-100 dark:bg-slate-700'

export default function CollectionDetails() {
  const { files: _files, collection } = useLoaderData<LoaderData>()
  const [files, setFiles] = useState(_files)

  const [activeId, setActiveId] = useState(null)
  const activeFile = files.find(f => f.sha === activeId)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragStart(ev: any) {
    setActiveId(ev.active.id)
  }

  function handleDragEnd(ev: any) {
    if (ev.active.id !== ev.over.id) {
      setFiles((files) => {
        const oldIndex = files.findIndex(f => f.id === ev.active.id)
        const newIndex = files.findIndex(f => f.id === ev.over.id)
        return arrayMove(files, oldIndex,  newIndex)
      })
    }

    setActiveId(null)
  }

  return (
    <div className="p-4">
      <h2 className="font-medium text-4xl mb-8">{collection.name}</h2>
      <ul className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={files} strategy={verticalListSortingStrategy}>
            {files.map((f) => <SortableItem activeId={activeId} key={f.id} file={f} />)}
          </SortableContext>
          <DragOverlay>
            {
              activeFile
                ? <ContentListItem file={activeFile} />
                : null
            }
          </DragOverlay>
        </DndContext>
      </ul>
    </div>
  )
}

function SortableItem({ activeId, file }: { activeId: string | null; file: TreeItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: file.sha })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <ContentListItem
      file={file}
      ref={setNodeRef}
      className={activeId === file.sha ? 'opacity-0' : 'opacity-100'}
      style={style}
      {...attributes}
      {...listeners}
    />
  )
}

type ListItemProps = {
  file: TreeItem;
  className?: string | null;
  style?: any
}

const ContentListItem = forwardRef(
  (
    { file, style, className, ...props }: ListItemProps,
    ref: React.ForwardedRef<HTMLLIElement>
  ) => {
    return (
      <li key={file.sha} style={style} {...props} ref={ref} className={className || ''}>
        <Link to={getBasename(file.path)} className={listCN}>
          {getBasename(file.path)}
        </Link>
      </li>
    )
  }
)
