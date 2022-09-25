const OAUTH_URL = 'https://github.com/login/oauth'
const API_URL = 'https://api.github.com'
const ACCEPT_HEADER = 'application/vnd.github+json'

type getAccessTokenParams = {
  code: string
  clientID: string
  clientSecret: string
}

export async function getAccessToken({ code, clientID, clientSecret }: getAccessTokenParams) {
  const url = `${OAUTH_URL}/access_token`
  const body = {
    client_id: clientID,
    client_secret: clientSecret,
    code
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  try {
    const data = await res.json()
    if (data?.error || !res.ok) {
      throw new Response(JSON.stringify(data), { status: 500 })
    }

    return data
  } catch (err) {
    if (err instanceof Response) {
      throw err
    } else {
      throw new Response(`Can't process token response: ${err}`, { status: 500 })
    }
  }
}

export async function getCurrentUser(token: string) {
  const res = await fetch(`${API_URL}/user`, {
    headers: {
      'Accept': ACCEPT_HEADER,
      'Authorization': `token ${token}`
    }
  })

  if (!res.ok) {
    // if this request failed then the passed token is invalid
    throw res
  }

  const user = await res.json()

  return {
    avatar: user.avatar_url,
    name: user.login
  } as User
}

export type User = {
  avatar: string
  name: string
}

export async function getOrgs(token: string) {
  const res = await fetch(`${API_URL}/user/orgs`, {
    headers: {
      'Accept': ACCEPT_HEADER,
      'Authorization': `token ${token}`
    }
  })

  if (!res.ok) {
    throw res
  }

  const data = await res.json()
  return data.map((o: any) => o.login) as string[]
}
