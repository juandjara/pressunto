import { cursorLineStart } from "@codemirror/commands"
import type { EditorView } from "@codemirror/view"

export function insertBlockquote(view: EditorView) {
  cursorLineStart(view)

  const changes = view.state.changeByRange((range) => {
    const markup = `> `
    const isApplied = view.state.sliceDoc(range.from, range.to + 2) === markup 
    const change = isApplied 
      ? { from: range.from, to: range.to + 2, insert: '' } 
      : { from: range.from, to: range.to, insert: markup }

    return {
      range,
      changes: [change]
    }
  })

  view.dispatch(
    view.state.update(
      changes,
      { scrollIntoView: true, userEvent: "input" }
    )
  )

  return true
}