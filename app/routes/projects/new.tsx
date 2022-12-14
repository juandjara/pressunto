import { Form, Link, useActionData, useFetcher, useLoaderData, useSearchParams, useTransition } from "@remix-run/react"
import { buttonCN, inputCN, labelCN } from '@/lib/styles'
import ComboBox from "@/components/ComboBox"
import type { RepoItem } from "@/lib/github"
import { getOrgs } from "@/lib/github"
import { useEffect, useMemo, useRef } from "react"
import debounce from 'debounce'
import type { ActionFunction, LoaderArgs} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { requireUserSession } from "@/lib/session.server"
import { createConfigFile, saveProject } from "@/lib/projects.server"
import InlineCode from "@/components/InlineCode"
import metaTitle from "@/lib/metaTitle"

const DEBOUNCE_TIME = 300

export const meta = {
  title: metaTitle('New Project')
}

type ActionData = undefined | { errors: { repo: string } }

export const action: ActionFunction = async ({ request }) => {
  const { user, token } = await requireUserSession(request)
  const formData = await request.formData()
  const title = formData.get('title') as string
  const repo = formData.get('repo') as string
  const branch = formData.get('branch') as string

  if (!repo) {
    return json({ errors: { repo: 'This field is required' } })
  }

  const project = { title, repo, branch }
  await Promise.all([
    saveProject(user.name, project),
    createConfigFile(token, project)
  ])

  return redirect(`/projects/${repo}`)
}

type LoaderData = {
  orgs: string[]
  user: string
}

export async function loader({ request }: LoaderArgs) {
  const { user, token } = await requireUserSession(request)
  const orgs = await getOrgs(token)
  return json<LoaderData>({ orgs, user: user.name })
}

export default function NewProject() {
  const { orgs, user } = useLoaderData<LoaderData>()
  const fetcher = useFetcher<RepoItem[]>()
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  const actionData = useActionData<ActionData>()
  const errors = actionData?.errors
  const selectRef = useRef<HTMLInputElement>(null)
  const orgSelectRef = useRef<HTMLSelectElement>(null)

  const [params] = useSearchParams()
  const defaultRepo = params.get('repo') || undefined

  const debouncedSearchFn = useMemo(
    () => debounce(
      (q: string) => {
        const org = orgSelectRef.current?.value
        return fetcher.load(`/api/search-repo?q=${q}&org=${org}`)
      },
      DEBOUNCE_TIME
    ),
    [fetcher]
  )

  useEffect(() => {
    if (errors && selectRef.current) {
      selectRef.current.focus()
    }
  }, [errors])

  return (
    <div className="px-3 py-8 max-w-screen-md">
      <header className="mb-4">
        <h2 className="font-medium text-4xl mb-2">New project</h2>
        <p>This will create a <InlineCode>pressunto.config.json</InlineCode> in the root of your repository</p>
      </header>
      <Form replace method="post">
        <fieldset disabled={busy} className="space-y-6">
          <div>
            <label className={labelCN} htmlFor="title">Title</label>
            <input required name='title' type='text' className={inputCN} />
          </div>
          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="repo">
                <p className={labelCN}>GitHub repo</p>
                <p className="text-sm mb-1">This search field will only list the repositories where you can push code </p>
              </label>
              {errors?.repo ? (
                <p className="text-sm mb-1 text-red-600 dark:text-red-400">{errors.repo}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <select ref={orgSelectRef} name="org" className={inputCN} style={{ flexBasis: '150px' }}>
                <option value={user}>{user}</option>
                {orgs.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <div className="flex-grow">
                <ComboBox<RepoItem>
                  inputRef={selectRef}
                  name='repo'
                  loading={fetcher.state === 'loading'}
                  options={fetcher.data || []}
                  onSearch={debouncedSearchFn}
                  labelKey='full_name'
                  valueKey='full_name'
                  defaultValue={defaultRepo}
                />
              </div>
            </div>
          </div>
          <div>
            <label className={labelCN} htmlFor="branch">Branch</label>
            <input placeholder="master" name='branch' type='text' className={inputCN} />
          </div>
        </fieldset>
        <div className="space-x-3 mt-8">
          <button
            type="submit"
            disabled={busy}
            className={`${buttonCN.normal} ${buttonCN.slate}`}
          >
            {busy ? 'Creating...' : 'Create'}
          </button>
          <Link to='/projects'>
            <button
              type="button"
              className={`${buttonCN.normal} hover:bg-slate-100 dark:hover:bg-slate-100/25`}
            >
              Cancel
            </button>
          </Link>
        </div>
      </Form>
    </div>
  )
}
