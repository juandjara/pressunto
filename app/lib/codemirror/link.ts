import { EditorSelection, Transaction } from "@codemirror/state"
import type { EditorView } from "@codemirror/view"

export function insertLink(view: EditorView) {
  const changes = view.state.changeByRange((range) => {
    const text = view.state.sliceDoc(range.from, range.to)
    return {
      changes: [{ from: range.from, to: range.to, insert: `[${text}](http://)` }],
      range
    }
  })

  view.dispatch(
    view.state.update(changes, {
      scrollIntoView: true,
      annotations: Transaction.userEvent.of('input'),
    })
  )

  const { to } = changes.selection.main
  view.dispatch({
    selection: EditorSelection.create([
      EditorSelection.range(to + 3, to + 10),
      EditorSelection.cursor(to + 10)
    ])
  })

  return true
}
