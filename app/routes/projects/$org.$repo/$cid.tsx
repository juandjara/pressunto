import type { CollectionFile, ProjectCollection } from "@/lib/projects.server"
import { getCollectionFiles } from "@/lib/projects.server"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react"
import { useState } from "react"
import { CSS } from '@dnd-kit/utilities'
import { useProject } from "@/lib/useProjectConfig"
import { createBlob, pushFolder } from "@/lib/github"

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
  const route = formData.get('collectionRoute') as string
  const files = JSON.parse(formData.get('files') as string) as CollectionFile[]

  const blobs = []
  for (const file of files) {
    const matter = Object.entries(file.attributes)
      .map(([key, value]) => `${key}: ${key === 'order' ? files.indexOf(file) : value}`)
      .join('\n')
    const content = `---
${matter}
---

${file.body}
`
    const newBlob = await createBlob(token, repo, content) as { sha: string }
    blobs.push({
      sha: newBlob.sha,
      path: file.path,
      mode: '100644',
      type: 'blob'
    })
  }

  const commit = await pushFolder(token, repo, branch, {
    message: `Updated order for files in ${route}`,
    files: blobs
  })

  return json({ commit })
}

const listCN = 'flex items-center pl-4 p-2 rounded-md text-lg bg-slate-100 dark:bg-slate-700'

export default function CollectionDetails() {
  const { files, collection } = useLoaderData<LoaderData>()

  return (
    <div className="p-4">
      <h2 className="font-medium text-4xl mb-8">{collection.name}</h2>
      <ul className="space-y-4">
        <SortableList files={files} />
      </ul>
    </div>
  )
}

function SortableList({ files: _files }: { files: CollectionFile[] }) {
  const [files, setFiles] = useState(_files)
  const [activeId, setActiveId] = useState(null)
  const activeFile = files.find(f => f.id === activeId)
  const submitFormData = useSubmit()
  const project = useProject()
  const { collection } = useLoaderData<LoaderData>()

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

      const data = {
        repo: project.repo,
        branch: project.branch,
        collectionRoute: collection.route,
        files: JSON.stringify(newFiles)
      }

      submitFormData(data, { method: 'post', replace: true })
    }

    setActiveId(null)
  }


  return (
    <Form method="post" className="space-y-4">
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
              ? <ContentListItem file={activeFile} />
              : null
          }
        </DragOverlay>
      </DndContext>
    </Form>
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
    pointerEvents: isActive ? 'none' : undefined
  }

  return (
    <li ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ContentListItem file={file} />
    </li>
  )
}

function ContentListItem({ file }: { file: CollectionFile }) {
  return (
    <Link to={file.name} className={listCN}>
      {file.title}
    </Link>
  )
}
