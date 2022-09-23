import { destroySession } from "@/lib/session.server"
import { json } from "@remix-run/node"
import type { ActionFunction } from "@remix-run/node"

export const action: ActionFunction = async ({ request }) => {
  return json({ ok: true }, {
    headers: {
      "Set-Cookie": await destroySession(request)
    },
  })
}
