export const APP_TITLE = 'Pressunto'

export default function metaTitle(title?: string) {
  return title ? `${title} | ${APP_TITLE}` : APP_TITLE
}