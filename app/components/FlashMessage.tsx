import { buttonCN } from "@/lib/styles"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { useMatches } from "@remix-run/react"
import { useState } from "react"

export default function FlashMessage() {
  const m = useMatches()
  const flashMessage = m[0].data.flashMessage
  const [open, setOpen] = useState(true)

  if (!flashMessage || !open) {
    return null
  }

  return (
    <div className="absolute z-40 top-3 left-3 md:left-12 overflow-hidden" role="alert">
      <div className="animate-alert flex items-center gap-4 pl-4 pr-2 py-2 rounded-md bg-slate-100 dark:bg-slate-600">
        <p>{flashMessage}</p>
        <button onClick={() => setOpen(false)} className={`p-1 ${buttonCN.common} ${buttonCN.cancel}`}>
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
