import { createCookie } from "@remix-run/node"

export const themeCookie = createCookie("color-scheme", {
  sameSite: "lax",
  path: "/",
  httpOnly: true
})

// from here: https://rossmoody.com/writing/remix-stitches
export async function getTheme(request: Request) {
  const cookieHeader = request.headers.get("Cookie")
  const cookieValue = (await themeCookie.parse(cookieHeader))
  const themeHeader = request.headers.get('Sec-CH-Prefers-Color-Scheme')

  return cookieValue || themeHeader || 'light'
}

export async function toggleTheme(request: Request) {
  const theme = await getTheme(request)
  const newTheme = theme === 'light' ? 'dark' : 'light'
  const cookie = await themeCookie.serialize(newTheme)
  return cookie
}
