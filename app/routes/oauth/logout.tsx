import { destroySession } from "@/lib/session.server"
import { redirect } from "@remix-run/node"
import type { ActionFunction } from "@remix-run/node"

export const action: ActionFunction = async ({ request }) => {
  return redirect('/', {
    headers: {
      "Set-Cookie": await destroySession(request)
    },
  })
}
