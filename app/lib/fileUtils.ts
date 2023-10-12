import { getBasename, getExtension, isMarkdown } from "./pathUtils"
import * as mime from 'mime'
import isbinary from 'is-binary-path'

type GithubFile = {
  content: string
  size: number
  type: string
  sha: string
  path: string
  download_url: string
  html_url: string
  encoding: 'base64' | 'none'
}

export function parseGithubFile(file: GithubFile) {
  const filename = getBasename(file.path)
  const extension = getExtension(filename)
  const lang = extensionToCodeMirrorLang(extension || '')
  const isBinary = isbinary(filename)
  const mimeType = mime.getType(filename)
  const format = mimeType?.split('/')[0] || ''

  let content = file.content
  if (!isBinary && file.encoding === 'base64') {
    content = b64DecodeUnicode(file.content)
  }

  return {
    ...file,
    lang,
    format,
    mimeType,
    isBinary,
    isMarkdown: isMarkdown(filename),
    content,
  }
}

// from here: https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
export function b64DecodeUnicode(str: string) {
  if (!str) return str
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}

export function b64EncodeUnicode(str: string) {
  if (!str) return str
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
          return String.fromCharCode(Number('0x' + p1))
  }))
}

function extensionToCodeMirrorLang(extension: string) {
  if (isMarkdown(extension)) return 'gfm'
  if (['js', 'json'].indexOf(extension) !== -1) return 'javascript'
  if (extension === 'html') return 'htmlmixed'
  if (extension === 'rb') return 'ruby'
  if (/(yml|yaml)/.test(extension)) return 'yaml'
  if (['java', 'c', 'cpp', 'cs', 'php'].indexOf(extension) !== -1) return 'clike'

  return extension
}
