import { buttonCN } from "@/lib/styles"
import useProjectConfig from "@/lib/useProjectConfig"
import { Cog6ToothIcon } from "@heroicons/react/20/solid"
import { Link } from "@remix-run/react"

export default function Collections() {
  const { collections } = useProjectConfig()

  return (
    <div className="p-4">
      <h2 className="font-medium text-4xl mb-2">Content</h2>
      {collections.length === 0 && (
        <p className="dark:text-stone-200">
          You don't have any saved collection.
        </p>
      )}
      <Link to='settings' className="mt-8 inline-block">
        <button className={`${buttonCN.normal} ${buttonCN.slate} ${buttonCN.iconLeft}`}>
          <Cog6ToothIcon className='w-6 h-6' />
          <p>Go to settings</p>
        </button>
      </Link>
    </div>
  )
}
