import { EditorSelection, Text, Transaction } from "@codemirror/state"
import type { EditorView, KeyBinding } from "@codemirror/view"

export function insertItalicMarker (view: EditorView) {
  const { state, dispatch } = view
  const changes = state.changeByRange((range) => {
    const isBoldBefore = state.sliceDoc(range.from - 1, range.from) === "_"
    const isBoldAfter = state.sliceDoc(range.to, range.to + 1) === "_"
    const changes = []

    changes.push(isBoldBefore ? {
      from: range.from - 1,
      to: range.from,
      insert: Text.of([''])
    } : {
      from: range.from,
      insert: Text.of(['_']),
    })

    changes.push(isBoldAfter ? {
      from: range.to,
      to: range.to + 1,
      insert: Text.of([''])
    } : {
      from: range.to,
      insert: Text.of(['_']),
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

export const italicBinding: KeyBinding[] = [
  {
    key: 'Mod-i',
    run: insertItalicMarker,
  },
]
