import fs from 'fs/promises'
import matter from 'front-matter'
import Markdown from 'markdown-it'
import emoji from 'markdown-it-emoji'
import headings from 'markdown-it-anchor'
// @ts-ignore
import toc from 'markdown-it-table-of-contents'

export async function getContent(slug: string) {
  const content = await fs.readFile(`${process.cwd()}/content/docs/${slug}.md`, 'utf-8')
  const { body, attributes } = matter<{ title: string }>(content)
  const html = new Markdown({ linkify: true, html: false })
    .use(emoji)
    .use(headings)
    .use(toc, {
      includeLevel: [3, 4],
      containerHeaderHtml: '<div class="toc-header">Table of contents:</div>',
      containerClass: 'toc mb-12',
      listClass: 'toc-list',
      itemClass: 'toc-item',
      linkClass: 'toc-link',
    })
    .render(body)

  return { html, title: attributes.title }
}