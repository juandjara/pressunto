import { EditorSelection, Text, Transaction } from "@codemirror/state"
import type { EditorView } from "@codemirror/view"

export function insertCodeMarker (view: EditorView) {
  const { state, dispatch } = view
  const changes = state.changeByRange((range) => {
    const isBoldBefore = state.sliceDoc(range.from - 1, range.from) === "`"
    const isBoldAfter = state.sliceDoc(range.to, range.to + 1) === "`"
    const changes = []

    changes.push(isBoldBefore ? {
      from: range.from - 1,
      to: range.from,
      insert: Text.of([''])
    } : {
      from: range.from,
      insert: Text.of(['`']),
    })

    changes.push(isBoldAfter ? {
      from: range.to,
      to: range.to + 1,
      insert: Text.of([''])
    } : {
      from: range.to,
      insert: Text.of(['`']),
    })

    const extendBefore = isBoldBefore ? -1 : 1
    const extendAfter = isBoldAfter ? -1 : 1

    return {
      changes,
      range: EditorSelection.range(range.from + extendBefore, range.to + extendAfter),
    }
  })

  dispatch(
    state.update(changes, {
      scrollIntoView: true,
      annotations: Transaction.userEvent.of('input'),
    })
  )

  view.focus()

  return true
}