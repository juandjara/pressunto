import Spinner from "@/components/Spinner"
import FileActionsMenu from "@/components/file-actions/FileActionsMenu"
import FileActionsModal from "@/components/file-actions/FileActionsModal"
import type { TreeItem } from "@/lib/github"
import { FileMode, getRepoDetails, getRepoFiles } from "@/lib/github"
import { getBasename } from "@/lib/pathUtils"
import { getProject } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { borderColor, buttonCN, iconCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { CloudArrowUpIcon, PhotoIcon } from "@heroicons/react/20/solid"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet, useActionData, useFetcher, useLoaderData, useParams, useRevalidator } from "@remix-run/react"
import clsx from "clsx"
import isBinaryPath from "is-binary-path"
import type { ChangeEvent } from "react"
import { useEffect, useRef, useState } from "react"

export async function loader({ params, request }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const tree = await getRepoFiles(token, project.repo, project.branch)
  const details = await getRepoDetails(token, project.repo)

  const branch = project.branch || details.default_branch
  const repo = project.repo

  return json({ tree, branch, repo })
}

type ModalData = {
  operation: 'move' | 'rename' | 'delete'
  file: TreeItem
}

export default function Media() {
  const conf = useProjectConfig()
  const mediaFolder = conf.mediaFolder === '/' ? '' : conf.mediaFolder
  const { tree, repo, branch } = useLoaderData<typeof loader>()
  const folders = tree.filter(t => t.type === 'tree')

  const images = tree.filter(t => isBinaryPath(t.path))
  const [previews, setPreviews] = useState([] as FilePreview[])

  const notExistingPreviews = previews
    .filter(p => !images.some(img => img.path.includes(p.name)))
    .map(p => ({
      sha: '',
      path: mediaFolder ? `${mediaFolder}/${p.name}` : p.name,
      type: 'blob' as const,
      mode: FileMode.FILE,
      url: p.url,
    }))

  const allImages = [...notExistingPreviews, ...images]
  const [modalData, setModalData] = useState<ModalData | null>(null)

  const data = useActionData()

  useEffect(() => {
    if (data) {
      setModalData(null)
    }
  }, [data])

  function closeModal() {
    setModalData(null)
  }

  return (
    <div className="p-4 relative">
      {modalData && (
        <FileActionsModal modalData={modalData} onClose={closeModal} folders={folders} />
      )}
      <header className="mb-8">
        <h2 className="font-medium text-4xl text-slate-500 dark:text-slate-300 mt-4 mb-2">
          Media
        </h2>
        <p className="max-w-prose font-medium">
          This page lists all the images in your repository. You can upload new images or move, rename or delete existing images.
        </p>
      </header>
      <ImageUpload onChange={setPreviews} />
      <p className="text-slate-500 dark:text-slate-300 text-sm mt-1">
        Images will be uploaded to your media folder <code>{mediaFolder}</code>. You can change this folder in <Link className="underline" to="../settings">project settings</Link>.
      </p>
      <Outlet />
      <ul className="my-8 flex items-start flex-wrap gap-4">
        {allImages.map(f => (
          <ImageCard
            file={f}
            key={f.sha}
            baseURL={`https://raw.githubusercontent.com/${repo}/${branch}`}
            setModalData={setModalData}
          />
        ))}
      </ul>
    </div>
  )
}

function ImageCard({
  baseURL,
  file,
  setModalData
}: {
  baseURL: string
  file: TreeItem
  setModalData: (data: ModalData) => void
}) {
  return (
    <li
      key={file.sha}
      className={
        clsx(
          borderColor,
          'group relative rounded-md border w-[250px]',
          { 'opacity-40 pointer-events-none': !file.sha }
        )
      }
    >
      <Link to={`./${file.sha}`} className="block relative">
        {!file.sha && (
          <div className="absolute mb-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Spinner className="h-12 w-12" />
          </div>
        )}
        <img
          loading="lazy"
          className="object-contain py-2 mx-auto w-40 h-40"
          src={file.sha ? `${baseURL}/${file.path}` : file.url}
          aria-labelledby={file.sha || ''}
        />
        <div className="p-2 rounded-b-md flex items-center gap-2 bg-slate-100 dark:bg-slate-700">
          <PhotoIcon className={clsx('flex-shrink-0', iconCN.big)} />
          <p id={file.sha || ''} className="text-lg truncate">{getBasename(file.path)}</p>
        </div>
      </Link>
      <FileActionsMenu file={file} setModalData={setModalData} />
    </li>
  )
}

type FilePreview = {
  url: string
  name: string
}

function ImageUpload({ onChange }: { onChange: (previews: FilePreview[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { project } = useParams()
  const actionURL = `/api/files/${project}`
  const revalidator = useRevalidator()
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle' && revalidator.state === 'idle')  {
      revalidator.revalidate()
    }
  }, [revalidator, fetcher])

  async function handleFileChange(ev: ChangeEvent<HTMLInputElement>) {
    fetcher.submit(ev.currentTarget.form, { replace: true })
    const files = ev.currentTarget.files || []
    const promises = Array.from([...files]).map((file) => {
      return new Promise<FilePreview>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            url: reader.result as string,
            name: file.name,
          })
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    })
    onChange(await Promise.all(promises))
  }

  return (
    <fetcher.Form action={actionURL} method="post" encType="multipart/form-data">
      <input
        ref={inputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        type="file"
        name="file"
        accept="image/*"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={clsx(buttonCN.slate, buttonCN.normal, buttonCN.iconLeft)}
      >
        <CloudArrowUpIcon className='w-5 h-5' />
        <p>Upload new images</p>
      </button>
    </fetcher.Form>
  )
}
