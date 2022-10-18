import type { EditorView } from "@codemirror/view"

export function insertHeading(level = 2, view: EditorView) {
  const changes = view.state.changeByRange((range) => {
    const line = view.state.doc.lineAt(range.head)

    const markup = `${'#'.repeat(level) } `
    const lineHeadingLevel = view.state.sliceDoc(line.from, line.to)
      .slice(0, 4)
      .split('')
      .filter(c => c === '#')
      .length

    const isHeading = lineHeadingLevel > 0
    const change = isHeading 
      ? { from: line.from, to: line.from + lineHeadingLevel + 1, insert: level === lineHeadingLevel ? '' : markup } 
      : { from: line.from, to: line.from, insert: markup }

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