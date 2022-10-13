import type { CollectionFile, ProjectCollection} from "@/lib/projects.server"
import { updateCollectionFileOrder } from "@/lib/projects.server"
import { getCollectionFiles } from "@/lib/projects.server"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react"
import { useState } from "react"
import { CSS } from '@dnd-kit/utilities'
import { useProject } from "@/lib/useProjectConfig"
import { ArrowsUpDownIcon, Bars2Icon } from "@heroicons/react/20/solid"
import { buttonCN } from "@/lib/styles"

type LoaderData = {
  files: CollectionFile[]
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

  const files = await getCollectionFiles(token, project, collection)

  return json<LoaderData>({ files, collection })
}

export const action: ActionFunction = async ({ request }) => {
  const { token } = await requireUserSession(request)
  const formData = await request.formData()
  const repo = formData.get('repo') as string
  const branch = formData.get('branch') as string
  const collectionRoute = formData.get('collectionRoute') as string
  const files = JSON.parse(formData.get('files') as string) as CollectionFile[]

  const commit = await updateCollectionFileOrder(token, {
    repo,
    branch,
    collectionRoute,
    files
  })

  return json({ commit })
}

const listCN = 'flex-grow block px-4 py-2 rounded-md text-lg bg-slate-100 dark:bg-slate-700'

type CollectionDisplay = 'links' | 'reorder'

export default function CollectionDetails() {
  const [mode, setMode] = useState<CollectionDisplay>('links')

  return mode === 'links' 
    ? <CollectionLinks onToggleMode={(mode: CollectionDisplay) => setMode(mode)} />
    : <CollectionReorder onToggleMode={(mode: CollectionDisplay) => setMode(mode)} />
}

type DisplayModeProps = {
  onToggleMode: (mode: CollectionDisplay) => void
}

function CollectionLinks({ onToggleMode }: DisplayModeProps) {
  const { files, collection } = useLoaderData<LoaderData>()
  const transition = useTransition()
  const fileList = transition.submission
    ? JSON.parse(transition.submission.formData.get('files') as string) as CollectionFile[]
    : files

  return (
    <div className="p-4">
      <header className="flex items-center">
        <h2 className="font-medium text-4xl mb-8">{collection.name}</h2>
        <div className="flex-grow"></div>
        <button
          type="button"
          title="Reorder posts"
          aria-label="Reorder posts"
          onClick={() => onToggleMode('reorder')}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-100/25">
          <ArrowsUpDownIcon className="w-6 h-6" />
        </button>
      </header>
      <ul className="space-y-4">
        {fileList.map((f) => (
          <li key={f.id}>
            <CollectionListItem file={f} clickable />
          </li>
        ))}
      </ul>
    </div>
  )
}

function CollectionReorder({ onToggleMode }: DisplayModeProps) {
  const project = useProject()
  const { collection, files: _files } = useLoaderData<LoaderData>()
  const [files, setFiles] = useState(_files)
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  return (
    <Form replace method="post" className="p-4" onSubmit={() => onToggleMode('links')}>
      <header className="flex items-center">
        <h2 className="font-medium text-4xl mb-8">{collection.name}</h2>
        <div className="flex-grow"></div>
        <button
          type="button"
          onClick={() => onToggleMode('links')}
          className={`ml-2 ${buttonCN.cancel} ${buttonCN.normal}`}>
          Cancel
        </button>
        <button disabled={busy} type="submit" className={`ml-2 ${buttonCN.slate} ${buttonCN.normal}`}>
          {busy ? 'Saving...' : 'Save'}
        </button>
      </header>
      <SortableList files={files} setFiles={setFiles} />
      <input type="hidden" name="repo" value={project.repo} />
      <input type="hidden" name="branch" value={project.branch} />
      <input type="hidden" name="collectionRoute" value={collection.route} />
      <input type="hidden" name="files" value={JSON.stringify(files)} />
    </Form>
  )
}

type SortableListProps = {
  files: CollectionFile[]
  setFiles: (f: CollectionFile[]) => any
}

function SortableList({ files, setFiles }: SortableListProps) {
  const [activeId, setActiveId] = useState(null)
  const activeFile = files.find(f => f.id === activeId)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(ev: any) {
    setActiveId(ev.active.id)
  }

  function handleDragEnd(ev: any) {
    if (ev.active.id !== ev.over.id) {
      const oldIndex = files.findIndex(f => f.id === ev.active.id)
      const newIndex = files.findIndex(f => f.id === ev.over.id)
      const newFiles = arrayMove(files, oldIndex,  newIndex)
      setFiles(newFiles)
    }

    setActiveId(null)
  }


  return (
    <ul className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={files} strategy={verticalListSortingStrategy}>
          {files.map((f) => <SortableItem key={f.id} file={f} isActive={activeId === f.id} />)}
        </SortableContext>
        <DragOverlay>
          {
            activeFile
              ? <CollectionListItem file={activeFile} />
              : null
          }
        </DragOverlay>
      </DndContext>
    </ul>
  )
}

function SortableItem({ file, isActive }: { file: CollectionFile; isActive: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: file.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isActive ? 0 : 1,
    pointerEvents: isActive ? 'none' : undefined,
    userSelect: 'none'
  }

  return (
    <li ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <CollectionListItem file={file} />
    </li>
  )
}

function CollectionListItem({ file, clickable = false }: { file: CollectionFile; clickable?: boolean }) {
  if (clickable) {
    return (
      <Link to={file.name} className={listCN}>
        {file.title}
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Bars2Icon className="h-4 w-4" />
      <p className={listCN}>{file.title}</p>
    </div>
  )
}
