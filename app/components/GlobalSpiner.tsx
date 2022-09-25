import { useTransition } from "@remix-run/react"

export default function GlobalSpinner() {
  const transition = useTransition()
  const active = transition.state !== 'idle'
  
  const containerCN = [
    'fixed z-50 inset-x-0 -top-1 h-1 bg-pink-500/25',
    'transition-transform duration-500 ease-in-out',
    active ? 'translate-y-full' : 'translate-y-0'
  ].join(' ')

  return (
    <div
      role="progressbar"
      aria-hidden={!active}
      aria-valuetext={active ? "Loading" : undefined}
      className={containerCN}
    >
      <div
        className="w-full h-full bg-gradient-to-r from-pink-500 to-rose-500 linearloading"
      />
    </div>
  )
}
