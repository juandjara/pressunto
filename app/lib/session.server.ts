import { createCookieSessionStorage } from "@remix-run/node"
import env from "./env.server"

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [env.secret], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
})

export async function getSessionData(request: Request) {
  const cookie = request.headers.get("cookie")
  const session = await sessionStorage.getSession(cookie)
  return session.data
}

export async function setSessionData(request: Request, data: Record<string, any>) {
  const cookie = request.headers.get("cookie")
  const session = await sessionStorage.getSession(cookie)
  for (const entry of Object.entries(data)) {
    session.set(entry[0], entry[1])
  }

  const sessionCookie = await sessionStorage.commitSession(session)
  return sessionCookie
}

export async function destroySession(request: Request) {
  const cookie = request.headers.get("cookie")
  const session = await sessionStorage.getSession(cookie)
  const sessionCookie = await sessionStorage.destroySession(session)
  return sessionCookie
}
