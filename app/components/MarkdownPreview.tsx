import { useMemo } from 'react'
import matter from 'front-matter'
import { marked } from 'marked'

export default function MarkdownPreview({ code }: { code: string }) {
  const markdown = useMemo(() => {
    const { body } = matter(code)
    return marked(body, { gfm: true })
  }, [code])

  return (
    <div className='prose prose-slate'>
      <div dangerouslySetInnerHTML={{ __html: markdown }} />  
    </div>
  )
}
