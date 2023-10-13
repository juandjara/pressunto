import { getContent } from "@/lib/content.server"
import metaTitle from "@/lib/metaTitle"
import { buttonCN } from "@/lib/styles"
import { ArrowLeftIcon } from "@heroicons/react/20/solid"
import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData, useNavigate } from "@remix-run/react"

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: metaTitle(data?.title)
  }
}

export async function loader({ params }: LoaderArgs) {
  const slug = params['*'] || 'index'
  const { html, title } = await getContent(slug)
  return { html, title }
}

export default function DocLayout() {
  const navigate = useNavigate()
  const { html } = useLoaderData()

  return (
    <div className="p-4 mb-8">
      <button
        onClick={() => navigate(-1)} 
        className={`-ml-1 mb-8 ${buttonCN.normal} ${buttonCN.iconLeft} ${buttonCN.cancel}`}>
        <ArrowLeftIcon className='w-5 h-5' />
        <span>Back</span>
      </button>
      <div
        className="prose md:prose-lg dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}>
      </div>
    </div>
  )
}
