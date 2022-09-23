
type getAccessTokenParams = {
  code: string
  clientID: string
  clientSecret: string
}

export async function getAccessToken({ code, clientID, clientSecret }: getAccessTokenParams) {
  const url = 'https://github.com/login/oauth/access_token'
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
    if (data?.error) {
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
  const userReq = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `token ${token}`
    }
  })

  if (!userReq.ok) {
    const text = await userReq.text()
    throw new Response(`User response failed: ${text}`, { status: userReq.status })
  }

  const user = await userReq.json()
  return user
}
