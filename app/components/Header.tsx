import type { User } from "@/lib/github"
import { Link, useFetcher, useLocation, useMatches } from "@remix-run/react"
import { Menu, Transition } from '@headlessui/react'

export default function Header({ user }: { user: User }) {
  const matches = useMatches()
  const location = useLocation()

  if (location.pathname === '/') {
    return null
  }

  const breadcrumbs = matches
    .filter(m => m.handle?.breadcrumb)
    .map((m, index) => (
      <li key={index}>
        {m.handle?.breadcrumb(m.data)}
      </li>
    ))

  return (
    <nav className="flex items-center p-3 border-b border-gray-200">
      <Link to="/" className="ml-1 inline-block text-slate-500">
        <h1 className="font-medium text-2xl font-serif">
          🐷
        </h1>
      </Link>
      <ul className="flex items-center justify-start ml-2 space-x-2">{breadcrumbs}</ul>
      <div className="flex-grow"></div>
      <UserMenu user={user} />
    </nav>
  )
}

function UserMenu({ user }: { user: User }) {
  return (
    <div className="z-20 relative flex-shrink-0 h-10">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button title="Open user menu">
              <span className="sr-only">Open user menu</span>
              <img
                className="rounded-full"
                src={user.avatar}
                width={40}
                height={40}
                title={user.name}
                alt={`github avatar for ${user.name}`}
              />
            </Menu.Button>
            <Transition
              show={open}
              enter="transition transform duration-100 ease-out"
              enterFrom="scale-x-50 opacity-0"
              enterTo="scale-x-100 opacity-100"
              leave="transition transform duration-100 ease-out"
              leaveFrom="scale-x-100 opacity-100"
              leaveTo="scale-x-50 opacity-0">
              <Menu.Items
                static
                className="absolute mr-3 mb-2 bottom-full right-full ring-1 ring-black ring-opacity-5">
                <div className="rounded-md shadow-md bg-white">
                  <LogoutButton />
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  )
}

// function UserMenu({ user }: { user: User }) {
//   const children = user ? (
//     <>
//       <LogoutButton />
//       <img
//         className="ml-1 rounded-full"
//         src={user.avatar}
//         width={40}
//         height={40}
//         title={user.name}
//         alt={`github avatar for ${user.name}`}
//       />
//     </>
//   ) : <LoginButton />

//   return (
//     // maintain 40px height to avoid CLS
//     <div className="flex items-center h-10">{children}</div>
//   )
// }

export function LoginButton() {
  const fetcher = useFetcher()
  const busy = fetcher.state === 'submitting'

  return (
    <fetcher.Form action='/oauth/login' method='post'>
      <button disabled={busy} className="disabled:opacity-50 flex rounded-lg text-white bg-slate-900 px-4 py-2">
        {busy ? 'Logging in...' : 'Log in'}
      </button>
    </fetcher.Form>
  )
}

export function LogoutButton({ variant = 'secondary' }: { variant?: 'primary' | 'secondary' }) {
  const fetcher = useFetcher()
  const busy = fetcher.state === 'submitting'
  const color = variant === 'secondary' ? 'text-slate-600 hover:bg-slate-100' : 'text-white bg-slate-900'

  return (
    <fetcher.Form action="/oauth/logout" method="post">
      <button disabled={busy} className={`disabled:opacity-50 whitespace-nowrap rounded-lg px-4 py-2 ${color}`}>
        {busy ? 'Logging out...' : 'Log out'}
      </button> 
    </fetcher.Form>
  )
}
