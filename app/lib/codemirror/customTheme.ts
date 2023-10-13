import { EditorView } from "@codemirror/view"

export const customTheme = EditorView.theme({
  '&': {
    fontSize: '16px',
    borderRadius: '8px',
  },
  '.cm-scroller': {
    maxHeight: '700px',
    overflow: 'auto'
  },
  '.cm-content': {
    padding: '12px 4px',
    paddingTop: '48px',
    maxWidth: 'min(75ch, calc(100vw - 46px))',
  },
  '& .cm-content': {
    minHeight: '300px',
  },
  '& .cm-gutters': {
    height: '300px',
  },
  '&.cm-editor.cm-focused': {
    outline: '2px solid #cbd5e1'
  },
  '.cm-gutters': {
    borderRadius: '8px 0 0 8px'
  },
  '.cm-gutter': {
    minWidth: '43px',
    textAlign: 'right',
    paddingRight: '4px',
  },
  '.cm-image-overflow': {
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
})
