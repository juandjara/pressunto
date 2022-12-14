import { cursorLineStart } from "@codemirror/commands"
import type { EditorView } from "@codemirror/view"

export function insertUL(view: EditorView) {
  cursorLineStart(view)

  const changes = view.state.changeByRange((range) => {
    const markup = `- `
    const otherMarkup = `* `
    const rangeText = view.state.sliceDoc(range.from, range.to + markup.length)
    const isApplied = rangeText === markup || rangeText === otherMarkup
    const change = isApplied 
      ? { from: range.from, to: range.to + markup.length, insert: '' } 
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

  view.focus()

  return true
}