import { Link, useLocation } from "@remix-run/react"

export default function Error() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const message = params.get('error')
  const description = params.get('error_description')
  const url = params.get('error_uri')

  return (
    <div className="max-w-xl mx-auto my-8">
      <div className="bg-red-50 text-red-800 rounded-xl p-4">
        <h1 className="text-2xl font-bold text-red-600">Github OAuth Error</h1>
        <h2 className="mt-1 text-xl font-bold text-red-600">{message}</h2>
        <p className="mb-2 mt-6 text-lg">{description}</p>
        {url ? (
          <a className="underline text-sm" href={url}>More info</a>
        ) : null}
      </div>
      <Link className="underline block mt-4 px-3" to='/'>Go Back</Link>
    </div>
  )
}