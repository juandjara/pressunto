import { buttonCN } from "@/lib/styles"
import { ArrowLeftIcon } from "@heroicons/react/20/solid"
import { Outlet, useNavigate } from "@remix-run/react"

export default function DocLayout() {
  const navigate = useNavigate()
  return (
    <div className="p-4 mb-8">
      <button
        onClick={() => navigate(-1)} 
        className={`-ml-2 mb-8 ${buttonCN.small} ${buttonCN.iconLeft} ${buttonCN.cancel}`}>
        <ArrowLeftIcon className='w-5 h-5' />
        <span>Back</span>
      </button>
      <div className="prose md:prose-lg dark:prose-invert">
        <Outlet />
      </div>
    </div>
  )
}
