import { useMemo } from 'react'
import matter from 'front-matter'
import Markdown from 'markdown-it'
import emoji from 'markdown-it-emoji'

export default function MarkdownPreview({ code }: { code: string }) {
  const markdown = useMemo(() => {
    const { body } = matter(code)
    return new Markdown({ linkify: true, html: false })
      .use(emoji)
      .render(body)
  }, [code])

  return (
    <div className='prose prose-slate dark:prose-invert'>
      {markdown.length ? (
        <div dangerouslySetInnerHTML={{ __html: markdown }} />
      ) : (
        <p className='min-h-[320px]'></p>
      )}
    </div>
  )
}
