export function getDirname(path: string) {
  return path.split('/').slice(0, -1).join('/')
}

export function getBasename(path: string) {
  return path.split('/').slice(-1)[0]
}

export function isMarkdown(file: string) {
  const regex = /.(md|mdx|mkdn?|mdown|markdown)$/
  return !!(regex.test(file))
}
