// NOTE: adapted from here: https://github.com/voracious/ink-mde/blob/main/src/vendor/extensions/images.ts
import { syntaxTree } from "@codemirror/language"
import type { EditorState, Extension, Range } from "@codemirror/state"
import { EditorSelection , RangeSet, StateField } from "@codemirror/state"
import type { DecorationSet} from "@codemirror/view"
import { EditorView, WidgetType , Decoration } from "@codemirror/view"
import { EditableComparment } from "./useCodeMirror"
import { uploadImage } from "@/lib/uploadImage"

const MD_IMAGE_REGEX = /!\[(?<title>.*)\]\((?<url>.*)\)/

class ImageFormatWidget extends WidgetType {
  readonly url: string
  readonly title: string

  constructor({ url, title }: { url: string; title: string }) {
    super()
    this.url = url
    this.title = title
  }

  eq(other: ImageFormatWidget) {
    return other.url === this.url
  }

  toDOM() {
    const div = document.createElement('div')
    div.className = 'bg-slate-700 inline-flex items-center gap-2 rounded-md py-1 px-2 max-w-full'
    div.innerHTML = `
      <svg class="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <span class="truncate">${this.title}</span>
    `
    return div
  }
}

function getDecorations(state: EditorState, mode: 'widget' | 'ranges' = 'widget') {
  const decorations = [] as Range<Decoration>[]

  syntaxTree(state).iterate({
    enter: ({ type, from, to }) => {
      if (type.name === "Image") {
        const token = state.doc.sliceString(from, to)
        const result = MD_IMAGE_REGEX.exec(token)
        const title = result?.groups?.title as string
        const url = result?.groups?.url as string
        if (url?.startsWith('data:')) {
          const line = state.doc.lineAt(from)
          const deco = Decoration
            .replace({ widget: new ImageFormatWidget({ url, title }), block: true })
            .range(line.from, line.to)
  
          decorations.push(deco)
        }
      }
    },
  })

  return decorations.length ? RangeSet.of(decorations) : Decoration.none
}

export const imageFormat = (): Extension => {
  return StateField.define<DecorationSet>({
    create(state) {
      return getDecorations(state)
    },
    update(value, transaction) {
      return getDecorations(transaction.state)
    },
    provide(field) {
      return EditorView.decorations.from(field)
    },
  })
}

async function uploadImageAsBase64(file: File, projectId: string) {
  const res = await fetch(`/api/upload-config/${projectId}`)
  const { token, repo, branch, folder } = await res.json() as { token: string, repo: string, branch: string, folder: string }
  const body = {
    repo,
    branch,
    folder,
    format: 'base64' as const,
    file: {
      filename: file.name,
      data: ''
    }
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result?.toString() || ''
      const base64 = dataUrl.split(',')[1]
      body.file.data = base64
      const file = await uploadImage(token, body)
      const url = file.content.download_url
      resolve(url)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function writeMarkup(view: EditorView, markup: string, mode: 'insert' | 'replace') {
  const changes = view.state.changeByRange((range) => {
    if (mode === 'replace') {
      return {
        range,
        changes: [{
          from: range.from,
          to: range.to,
          insert: markup
        }]
      }
    }

    return {
      range: EditorSelection.range(range.from, range.from + markup.length),
      changes: [{
        from: range.from,
        insert: markup
      }]
    }
  })
  view.dispatch(
    view.state.update(
      changes,
    )
  )
}

export async function insertImage(view: EditorView, file: File, projectId: string) {
  writeMarkup(view, `![${file.name}](Uploading ${file.name}...) `, 'insert')
  view.dispatch({
    effects: EditableComparment.reconfigure(EditorView.editable.of(false))
  })
  
  try {
    const url = await uploadImageAsBase64(file, projectId)
    writeMarkup(view, `![${file.name}](${url}) `, 'replace')
  } catch (err) {
    writeMarkup(view, `![${file.name}](Upload failed: ${(err as Error).message}) `, 'replace')
  }

  view.dispatch({
    effects: EditableComparment.reconfigure(EditorView.editable.of(true))
  })
}
