import type { StateCommand} from "@codemirror/state"
import { EditorSelection, Text, Transaction } from "@codemirror/state"
import type { KeyBinding } from "@codemirror/view"

export const insertBoldMarker: StateCommand = ({ state, dispatch }) => {
  const changes = state.changeByRange((range) => {
    const isBoldBefore = state.sliceDoc(range.from - 2, range.from) === "**"
    const isBoldAfter = state.sliceDoc(range.to, range.to + 2) === "**"
    const changes = []

    changes.push(isBoldBefore ? {
      from: range.from - 2,
      to: range.from,
      insert: Text.of([''])
    } : {
      from: range.from,
      insert: Text.of(['**']),
    })

    changes.push(isBoldAfter ? {
      from: range.to,
      to: range.to + 2,
      insert: Text.of([''])
    } : {
      from: range.to,
      insert: Text.of(['**']),
    })

    const extendBefore = isBoldBefore ? -2 : 2
    const extendAfter = isBoldAfter ? -2 : 2

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

  return true
}

export const boldBinding: KeyBinding[] = [
  {
    key: 'Mod-b',
    run: insertBoldMarker,
  },
]
