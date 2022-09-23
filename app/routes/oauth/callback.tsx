import { redirect } from "@remix-run/node"
import type { LoaderFunction } from "@remix-run/node"
import { setSessionData } from "@/lib/session.server"
import env from "@/lib/env.server"
import { getAccessToken, getCurrentUser } from '@/lib/github'

/**
 * called when github oauth redirects back here with a GET request
 */
export const loader: LoaderFunction = async ({ request }) => {
  const originURL = new URL(request.url)
  const code = originURL.searchParams.get('code')
  const error = originURL.searchParams.get('error')

  if (error) {
    throw redirect(`/oauth/error?${originURL.searchParams.toString()}`)
  }

  if (!code) {
    throw new Response('code param must be recevied in callback url', { status: 500 })
  }

  const tokenData = await getAccessToken({
    clientID: env.clientID,
    clientSecret: env.clientSecret,
    code
  })

  const user = await getCurrentUser(tokenData.access_token)

  const sessionCookie = await setSessionData(request,  {
    token: tokenData.access_token,
    username: user.login,
    avatar: user.avatar_url
  })

  const headers = new Headers({ 'Set-cookie': sessionCookie })

  return redirect('/search', { headers })
}
