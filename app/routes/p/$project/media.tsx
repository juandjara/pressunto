import { getRepoDetails, getRepoFiles, uploadImage } from "@/lib/github"
import { getProject, getProjectConfig } from "@/lib/projects.server"
import { requireUserSession } from "@/lib/session.server"
import { borderColor, buttonCN, iconCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { CloudArrowUpIcon, PhotoIcon } from "@heroicons/react/20/solid"
import type { ActionArgs, LoaderArgs, UploadHandlerPart } from "@remix-run/node"
import { json, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react"
import clsx from "clsx"
import isBinaryPath from "is-binary-path"
import type { ChangeEvent} from "react"
import { useRef, useState } from "react"

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

  async function githubUploadHandler({ name, contentType, data, filename }: UploadHandlerPart) {
    if (name !== 'file') return
    const file = await uploadImage(token, {
      repo: project.repo,
      branch: project.branch,
      folder: conf.mediaFolder || '',
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
  const urls = formData.getAll('file')
  return urls
}

export default function Media() {
  const conf = useProjectConfig()
  const mediaFolder = conf.mediaFolder === '/' ? '' : conf.mediaFolder
  const { tree, repo, branch } = useLoaderData<typeof loader>()
  const folders = tree.filter(t => t.type === 'tree')
  folders.unshift({
    path: '/',
    type: 'tree' as const,
    url: '',
    mode: '',
    sha: '',
  })

  const images = tree.filter(t => isBinaryPath(t.path))
  const [previews, setPreviews] = useState([] as FilePreview[])

  const notExistingPreviews = previews
    .filter(p => !images.some(img => img.path.includes(p.name)))
    .map(p => ({
      path: `${mediaFolder}/${p.name}`,
      type: 'blob' as const,
      url: p.url,
      mode: '',
      sha: '',
    }))

  const allImages = [...images, ...notExistingPreviews]

  return (
    <div className="p-4">
      <header className="mb-8">
        <h2 className="font-medium text-4xl text-slate-500 dark:text-slate-300 mt-4 mb-2">
          Media
        </h2>
        <p className="max-w-prose font-medium">
          This page lists all the images in your repository
        </p>
      </header>
      <ImageUpload onChange={setPreviews} />
      <ul className="my-8 flex items-start flex-wrap gap-4">
        {allImages.map(f => (
          <li key={f.sha} className={clsx('rounded-md border w-[250px]', borderColor, { 'opacity-50': !f.sha })}>
            <img loading="lazy" className="object-contain py-2 mx-auto w-40 h-40 mb-2" src={`https://raw.githubusercontent.com/${repo}/${branch}/${f.path}`} alt={f.path} />
            <Link to={`../source/${f.path}`} className="p-2 rounded-b-md flex items-center gap-3 bg-slate-100 dark:bg-slate-700">
              <PhotoIcon className={clsx('flex-shrink-0', iconCN.big)} />
              <p className="text-lg truncate">{f.path}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
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

  // function removeFile(idx: number) {
  //   if (inputRef.current) {
  //     const dt = new DataTransfer()
  //     ;[...(inputRef.current.files || [])].forEach((f, i) => {
  //       if (i !== idx) {
  //         dt.items.add(f)
  //       }
  //     })
  //     inputRef.current.files = dt.files
  //   }
  //   setPreviews(prev => prev.filter((_, i) => i !== idx))
  // }

  // function clearFiles() {
  //   if (inputRef.current) {
  //     inputRef.current.files = null
  //   }
  //   setPreviews([])
  // }

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
      {/* <div className="flex items-start gap-4 py-4 flex-wrap mt-4">
        {previews.map((preview, idx) => (
          <div key={idx} className="relative">
            <img className="w-40 h-40 rounded-md object-cover" src={preview} alt="" />
            <button
              type="button"
              aria-label="Remove file"
              title="Remove file"
              onClick={() => removeFile(idx)}
              className={clsx('absolute top-0 right-0 text-sm p-1 bg-white/50 rounded-tr-md rounded-bl-md', buttonCN.cancel)}
            >
              <CloseIcon className='w-5 h-5' />
            </button>
          </div>
        ))}  
      </div>
      {previews.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className={clsx(buttonCN.slate, buttonCN.normal)}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={clearFiles}
            className={clsx(buttonCN.cancel, buttonCN.normal)}
          >
            Cancel
          </button>       
        </div>
      )} */}
    </Form>
  )
}
