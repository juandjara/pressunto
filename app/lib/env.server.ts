import invariant from 'tiny-invariant'

const secret = process.env.SESSION_SECRET
invariant(secret, 'process.env.SESSION_SECRET must be defined')

const clientID = process.env.GITHUB_CLIENT_ID
invariant(clientID, 'process.env.GITHUB_CLIENT_ID must be defined')

const clientSecret = process.env.GITHUB_CLIENT_SECRET
invariant(clientSecret, 'process.env.GITHUB_CLIENT_SECRET must be defined')

const env = { secret, clientID, clientSecret }
export default env
