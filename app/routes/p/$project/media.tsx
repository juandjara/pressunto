import { ComboBoxLocal } from "@/components/ComboBoxLocal"
import Modal from "@/components/Modal"
import type { TreeItem} from "@/lib/github"
import { deleteFile, getRepoDetails, getRepoFiles, renameFile } from "@/lib/github"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import { borderColor, buttonCN, iconCN, inputCN, labelCN } from "@/lib/styles"
import { uploadImage } from "@/lib/uploadImage"
import useProjectConfig from "@/lib/useProjectConfig"
import { Menu, Transition } from "@headlessui/react"
import { CloudArrowUpIcon, EllipsisVerticalIcon, FolderOpenIcon, PencilIcon, PhotoIcon, TrashIcon } from "@heroicons/react/20/solid"
import type { ActionArgs, LoaderArgs, UploadHandlerPart } from "@remix-run/node"
import { json, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"
import { Form, Link, useActionData, useFetcher, useLoaderData, useTransition } from "@remix-run/react"
import clsx from "clsx"
import isBinaryPath from "is-binary-path"
import type { ChangeEvent} from "react"
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

export async function action({ params, request }: ActionArgs) {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const conf = await getProjectConfig(token, project)
  const folder = conf.mediaFolder === '/' ? '' : conf.mediaFolder || ''

  // differiantiate between "file upload" and "file edit / delete" using http method to not affect the reading of form data

  // upload file
  if (request.method.toLowerCase() === 'post') {
    async function githubUploadHandler({ name, contentType, data, filename }: UploadHandlerPart) {
      if (name !== 'file') return
      const file = await uploadImage(token, {
        repo: project.repo,
        branch: project.branch,
        folder,
        file: {
          contentType,
          data,
          filename: filename!,
        }
      })
      return file.content.path
    }
  
    const uploadHandler = unstable_composeUploadHandlers(
      githubUploadHandler,
      unstable_createMemoryUploadHandler(),
    )
  
    const formData = await unstable_parseMultipartFormData(request, uploadHandler)
    const files = formData.getAll('file') as string[]
    const cookie = await setFlashMessage(request, `Pushed commit "upload image ${files} to ${folder || 'root folder'}" successfully`)
    return json({ ok: true }, { headers: { 'Set-Cookie': cookie }})
  }

  // rename file or move to other folder
  if (request.method.toLowerCase() === 'put') {
    const fd = await request.formData()
    const sha = fd.get('sha') as string
    const path = fd.get('path') as string
    const operation = fd.get('operation') as 'move' | 'rename'

    let newPath = ''
    if (operation === 'move') {
      const folder = fd.get('folder') as string
      newPath = `${folder}/${basename(path)}`
    }
    if (operation === 'rename') {
      const name = fd.get('name') as string
      newPath = `${dirname(path)}/${name}`
    }

    const message = `Move file ${path} to ${newPath}`
    await renameFile(token, {
      repo: project.repo,
      branch: project.branch,
      sha,
      path,
      newPath,
      message
    })

    const cookie = await setFlashMessage(request, `Pushed commit "${message}" successfully`)
    return json({ ok: true }, { headers: { 'Set-Cookie': cookie }})
  }

  // delete file
  if (request.method.toLowerCase() === 'delete') {
    const fd = await request.formData()
    const path = fd.get('path') as string

    const message = `Delete file ${path}`
    await deleteFile(token, {
      branch: project.branch,
      repo: project.repo,
      message,
      path,
    })

    const cookie = await setFlashMessage(request, `Pushed commit "${message}" successfully`)
    return json({ ok: true }, { headers: { 'Set-Cookie': cookie }})
  }
}

function basename(path: string) {
  return path.split('/').pop() || ''
}
function dirname(path: string) {
  return path.split('/').slice(0, -1).join('/')
}

type ModalData = {
  operation: 'move' | 'rename' | 'delete'
  file: TreeItem
}

const modalTitle = {
  move: 'Move file to another folder',
  rename: 'Rename file',
  delete: 'Delete file'
}
const modalConfirmLabel = {
  move: 'Move',
  rename: 'Rename',
  delete: 'Delete'
}
const modalBusyLabel = {
  move: 'Moving...',
  rename: 'Renaming...',
  delete: 'Deleting...'
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
      path: mediaFolder ? `${mediaFolder}/${p.name}` : p.name,
      type: 'blob' as const,
      url: p.url,
      mode: '',
      sha: '',
    }))

  const allImages = [...images, ...notExistingPreviews]
  const [modalData, setModalData] = useState<ModalData | null>(null)

  const transition = useTransition()
  const busy = transition.state !== 'idle'

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
        <Modal open onClose={closeModal} title={modalTitle[modalData.operation]}>
          <Form replace method={modalData.operation === 'delete' ? 'delete' : 'put'}>
            <input type="hidden" name="sha" value={modalData.file.sha} />
            <input type="hidden" name="path" value={modalData.file.path} />
            {modalData?.operation === 'move' && (
              <div>
                <label htmlFor="folder" className={labelCN}>New folder for the file</label>
                <ComboBoxLocal<TreeItem>
                  name='folder'
                  options={folders}
                  labelKey='path'
                  valueKey='path'
                  defaultValue={dirname(modalData.file.path)}
                />
              </div>
            )}
            {modalData?.operation === 'rename' && (
              <div className="my-4">
                <label htmlFor="name" className={labelCN}>New name for the file</label>
                <input
                  required
                  type="text"
                  name="name"
                  defaultValue={basename(modalData.file.path)}
                  className={inputCN}
                />
              </div>
            )}
            {modalData?.operation === 'delete' && (
              <div>
                <p className="text-slate-600 dark:text-slate-200 text-lg max-w-prose my-4">
                  Are you sure you want to delete the file <code>{modalData.file.path}</code> ?
                </p>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={closeModal}
                className={`${buttonCN.normal} ml-3 hover:bg-slate-100 dark:hover:bg-slate-100/25`}>
                Cancel
              </button>
              <button
                type="submit"
                name="operation"
                value={modalData.operation}
                disabled={busy}
                className={
                  clsx({
                    [buttonCN.slate]: modalData.operation !== 'delete',
                    [buttonCN.deleteBold]: modalData.operation === 'delete'
                  }, buttonCN.normal)
                }>
                {busy ? modalBusyLabel[modalData.operation] : modalConfirmLabel[modalData.operation]}
              </button>
            </div>
          </Form>
        </Modal>
      )}
      <header className="mb-8">
        <h2 className="font-medium text-4xl text-slate-500 dark:text-slate-300 mt-4 mb-2">
          Media
        </h2>
        <p className="max-w-prose font-medium">
          This page lists all the images in your media folder <code>{mediaFolder}</code>
        </p>
      </header>
      <ImageUpload onChange={setPreviews} />
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
  const transition = useTransition()
  const busy = transition.state !== 'idle'

  function handleMove() {
    setModalData({
      operation: 'move',
      file
    })
  }
  function handleRename() {
    setModalData({
      operation: 'rename',
      file
    })
  }
  function handleDelete() {
    setModalData({
      operation: 'delete',
      file
    })
  }

  return (
    <li key={file.sha} className={clsx('group relative rounded-md border w-[250px]', borderColor, { 'opacity-50': !file.sha })}>
      <Link to={`../source/${file.path}`} className="block relative">
        <img loading="lazy" className="object-contain py-2 mx-auto w-40 h-40" src={`${baseURL}/${file.path}`} aria-labelledby={file.sha} />
        <div className="p-2 rounded-b-md flex items-center gap-2 bg-slate-100 dark:bg-slate-700">
          <PhotoIcon className={clsx('flex-shrink-0', iconCN.big)} />
          <p id={file.sha} className="text-lg truncate">{basename(file.path)}</p>
        </div>
      </Link>
      <Menu as="div" className="z-20 absolute top-0 left-0">
        {({ open }) => (
          <>
            <Menu.Button
              as="button"
              type="button"
              title="Open actions menu"
              aria-label="Open actions menu"
              className={clsx({ 'md:opacity-0': !open }, 'group-hover:opacity-100 transition-opacity p-2 rounded-md', buttonCN.cancel)}
            >
              <EllipsisVerticalIcon className="w-6 h-6" />
            </Menu.Button> 
            <Transition
              show={open}
              enter="transition transform duration-100 ease-out"
              enterFrom="scale-y-50 opacity-0"
              enterTo="scale-y-100 opacity-100"
              leave="transition transform duration-100 ease-out"
              leaveFrom="scale-y-100 opacity-100"
              leaveTo="scale-y-50 opacity-0">
              <Menu.Items
                static
                className="w-72 rounded-md shadow-lg absolute top-full left-0 ring-1 ring-black ring-opacity-5">
                <div className="rounded-md text-left py-2 bg-white dark:bg-slate-600">
                  <Menu.Item
                    as="button"
                    type="button"
                    disabled={busy}
                    onClick={handleMove}
                    className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                  >
                    <FolderOpenIcon className="w-5 h-5" />
                    <span>Move to another folder</span>
                  </Menu.Item>
                  <Menu.Item
                    as="button"
                    type="button"
                    disabled={busy}
                    onClick={handleRename}
                    className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.cancel, buttonCN.normal)}
                  >
                    <PencilIcon className="w-5 h-5" />
                    <span>Rename file</span>
                  </Menu.Item>
                  <Menu.Item
                    as="button"
                    type='button'
                    disabled={busy}
                    onClick={handleDelete}
                    className={clsx('w-full text-left rounded-none', buttonCN.iconLeftWide, buttonCN.delete, buttonCN.normal)}
                  >
                    <TrashIcon className="w-5 h-5" />
                    <p>Delete file</p>
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </li>
  )
}

type FilePreview = {
  url: string
  name: string
}

function ImageUpload({ onChange }: { onChange: (previews: FilePreview[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const fetcher = useFetcher()

  async function handleFileChange(ev: ChangeEvent<HTMLInputElement>) {
    fetcher.submit(ev.currentTarget.form, {
      method: 'post',
      encType: 'multipart/form-data',
      replace: true,
    })
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
    <Form method="post" encType="multipart/form-data">
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
      <p className="text-slate-500 dark:text-slate-300 text-sm mt-1">
        Images will be uploaded to your media folder. You can change this folder in <Link className="underline" to="../settings">project settings</Link>.
      </p>
    </Form>
  )
}
