import { cursorLineStart } from "@codemirror/commands"
import type { EditorView } from "@codemirror/view"

export function insertHeading(level = 2, view: EditorView) {
  cursorLineStart(view)

  const changes = view.state.changeByRange((range) => {
    const markup = `${'#'.repeat(level) } `
    const isHeading = view.state.sliceDoc(range.from, range.to + level + 1) === markup 
    const change = isHeading 
      ? { from: range.from, to: range.to + level + 1, insert: '' } 
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