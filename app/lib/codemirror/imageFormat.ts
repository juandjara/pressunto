// NOTE: adapted from here: https://github.com/voracious/ink-mde/blob/main/src/vendor/extensions/images.ts

import { cursorLineDown, insertBlankLine } from "@codemirror/commands"
import { syntaxTree } from "@codemirror/language"
import type { EditorState, Extension, Range} from "@codemirror/state"
import { RangeSet, StateField } from "@codemirror/state"
import type { DecorationSet} from "@codemirror/view"
import { EditorView, WidgetType } from "@codemirror/view"
import { Decoration } from "@codemirror/view"

const IMAGE_REGEX = /!\[(?<title>.*)\]\((?<url>.*)\)/

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
    div.className = 'cm-image-overflow bg-slate-700 flex items-center gap-2 rounded-md py-1 px-2'
    div.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <span>${this.title}</span>
    `
    return div
  }
}

function getDecorations(state: EditorState) {
  const decorations = [] as Range<Decoration>[]

  syntaxTree(state).iterate({
    enter: ({ type, from, to }) => {
      if (type.name === "Image") {
        const result = IMAGE_REGEX.exec(state.doc.sliceString(from, to))
        const title = result?.groups?.title as string
        const url = result?.groups?.url as string
        if (url.startsWith('data:')) {
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

export function insertImage(view: EditorView, file: File) {
  const reader = new FileReader()
  reader.addEventListener('load', (ev) => {
    const src = ev.target?.result as string
    const markup = `![${file.name}](${src})`

    const changes = view.state.changeByRange((range) => {
      return {
        range,
        changes: [{
          from: range.from,
          to: range.to,
          insert: markup
        }]
      }
    })
    view.dispatch(
      view.state.update(
        changes,
      )
    )

    insertBlankLine(view)
    cursorLineDown(view)
  })
  reader.readAsDataURL(file)
}
