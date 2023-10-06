import { callGithubAPI } from "./github"

type FileUploadParams = {
  repo: string
  branch: string
  folder: string
} & ({
  format: 'base64'
  file: {
    filename: string
    data: string
  }
} | {
  format?: never
  file: {
    filename: string
    contentType: string
    data: AsyncIterable<Uint8Array>
  }
})

async function asyncIterableToBase64(iterable: AsyncIterable<Uint8Array>) {
  let result = ''
  for await (const chunk of iterable) {
    result += btoa(String.fromCharCode.apply(null, [...chunk]))
  }
  return result
}

export async function uploadImage(token: string, params: FileUploadParams) {
  const { filename, data } = params.file
  const path = params.folder ? `${params.folder}/${filename}` : filename
  const url = `/repos/${params.repo}/contents/${path}`
  const body = {
    branch: params.branch,
    message: `upload image ${filename} to ${params.folder || 'root folder'}`,
    content: params.format === 'base64' ? data : await asyncIterableToBase64(data as AsyncIterable<Uint8Array>),
  }
  const { data: file } = await callGithubAPI(token, url, { method: 'PUT', body: JSON.stringify(body) })
  return file
}
