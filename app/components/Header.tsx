// import { authenticateWithPopup, logout, useAuth } from './AuthContext'

// export default function Header() {
//   return (
//     <nav className="flex items-center p-3 border-b border-gray-200">
//       <a href="/" className="ml-1 inline-block text-cyan-500">
//         <h1 class="font-bold text-xl tracking-wide">Cachopo Master System</h1>
//       </a>
//       <div className="flex-grow"></div>
//       <UserMenu />
//     </nav>
//   )
// }

// function UserMenu() {
//   const auth = useAuth()

//   const children = auth.user.value ? (
//     <>
//       <button onClick={logout}>Logout</button>
//       <img className="ml-3 rounded-full" src={auth.user.value.avatar_url} width={40} height={40} />
//     </>
//   ) : (
//     <button onClick={authenticateWithPopup}>Login</button>
//   )

//   // maintain height 40px to avoid CLS
//   return <div className="flex items-center h-10">{children}</div>
// }
