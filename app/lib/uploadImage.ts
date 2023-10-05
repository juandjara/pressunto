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

const API_URL = 'https://api.github.com'
const ACCEPT_HEADER = 'application/vnd.github+json'

type fetchURL = Parameters<typeof fetch>[0]
type fetchOptions = Parameters<typeof fetch>[1]

async function callGithubAPI(token: string, url: fetchURL, options?: fetchOptions) {
  const fullUrl = typeof url === 'string' ? API_URL + url : url
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': ACCEPT_HEADER,
      'Authorization': `Bearer ${token}`,
      ...options?.headers
    }
  })

  if (!res.ok) {
    throw res
  }

  const data = await res.json()
  return { data, headers: res.headers }
}
