import { EditorView } from "@codemirror/view"

export const customTheme = EditorView.theme({
  '&': {
    fontSize: '16px',
    borderRadius: '8px',
  },
  '.cm-content, .cm-gutter': {
    minHeight: '200px'
  },
  '.cm-content': {
    padding: '12px 4px',
    paddingTop: '54px',
    maxWidth: '75ch'
  },
  '&.cm-editor.cm-focused': {
    outline: '2px solid #cbd5e1'
  },
  '.cm-gutters': {
    borderRadius: '8px 0 0 8px'
  },
  '.cm-gutter': {
    minWidth: '36px',
    textAlign: 'right',
    paddingRight: '4px',
  }
})
