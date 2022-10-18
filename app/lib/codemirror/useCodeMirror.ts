import type { MutableRefObject } from "react"
import { useRef, useState, useEffect } from "react"
import { EditorState } from "@codemirror/state"
import type { KeyBinding } from "@codemirror/view"
import {
  EditorView,
  lineNumbers,
  highlightSpecialChars,
  dropCursor,
  drawSelection,
  keymap
} from "@codemirror/view"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { syntaxHighlighting, HighlightStyle, defaultHighlightStyle, bracketMatching } from "@codemirror/language"
import { tags } from "@lezer/highlight"
import { searchKeymap } from '@codemirror/search'
import { historyKeymap, history } from '@codemirror/commands'
import { basicDark } from 'cm6-theme-basic-dark'
import { boldBinding } from "./bold"
import { italicBinding } from "./italic"
import { customTheme } from "./customTheme"
import { baseTheme } from "./baseTheme"

type useCodeMirrorProps = {
  initialValue: string
  setValue: (v: string) =>  void
}

const markdownHighlighting = HighlightStyle.define([
  { tag: tags.heading1, fontSize: "1.6em", fontWeight: "bold" },
  {
    tag: tags.heading2,
    fontSize: "1.4em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading3,
    fontSize: "1.2em",
    fontWeight: "bold",
  },
])

export default function useCodeMirror(
  textarea: MutableRefObject<HTMLTextAreaElement | null>,
  { initialValue, setValue }: useCodeMirrorProps
) {
  const ref = useRef(null)
  const [view, setView] = useState<EditorView>()
  const [flags, setFlags] = useState({
    isHeading: false,
    isBold: false,
    isItalic: false
  })

  useEffect(() => {
    if (!ref.current) {
      return
    }

    if (textarea.current) {
      textarea.current.style.display = 'none'
    }

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        lineNumbers(),
        highlightSpecialChars(),
        drawSelection(),
        dropCursor(),
        history(),
        bracketMatching(),
        EditorState.allowMultipleSelections.of(true),
        markdown({
          base: markdownLanguage, // Support GFM
        }),
        syntaxHighlighting(markdownHighlighting),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        customTheme,
        baseTheme,
        basicDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of((ev) => {
          const range = ev.state.wordAt(ev.state.selection.main.head)

          let isBold = false
          let isItalic = false
          if (range) {
            const singleWord = ev.state.sliceDoc(range.from - 1, range.to + 1).trim()
            const doubleWord = ev.state.sliceDoc(range.from - 2, range.to + 2).trim()

            isBold = doubleWord.startsWith('**') && doubleWord.endsWith('**')
            isItalic = singleWord.startsWith('_') && singleWord.endsWith('_')
          }

          const line = ev.state.doc.lineAt(ev.state.selection.main.head)
          const isHeading = ev.state.sliceDoc(line.from, line.to).startsWith('#')

          setFlags({
            isHeading,
            isBold,
            isItalic
          })

          if (ev.docChanged) {
            setValue(ev.state.doc.toString())
          }
        }),
        keymap.of([
          // ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...boldBinding,
          ...italicBinding
        ] as readonly KeyBinding[]),
      ]
    })

    const view = new EditorView({ state, parent: ref.current })
    setView(view)

    const css = (view as any).styleModules.map((t: any) => t.getRules()).reverse().join('\n')

    const existingHeadEl = document.head.querySelector('style')
    if (!existingHeadEl) {
      const style = document.createElement('style')
      style.id = 'codemirror-css'
      style.innerHTML = css
      document.head.appendChild(style)
    }

    return () => {
      view.destroy()
    }
  }, [ref, textarea])

  return [ref, view, flags] as [typeof ref, typeof view, typeof flags]
}
