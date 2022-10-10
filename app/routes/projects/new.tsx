import { Form, Link, useActionData, useFetcher, useSearchParams, useTransition } from "@remix-run/react"
import { buttonCN, inputCN, labelCN } from '@/lib/styles'
import ComboBox from "@/components/ComboBox"
import type { RepoItem } from "@/lib/github"
import { createConfigFile } from "@/lib/github"
import { useEffect, useMemo, useRef } from "react"
import debounce from 'debounce'
import type { ActionFunction} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { requireUserSession } from "@/lib/session.server"
import { saveProject } from "@/lib/projects.server"
import InlineCode from "@/components/InlineCode"

const DEBOUNCE_TIME = 300

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

  await Promise.all([
    saveProject(user.name, { title, repo, branch }),
    createConfigFile(token, repo, branch)
  ])

  return redirect(`/projects/${repo}`)
}

export default function NewProject() {
  const fetcher = useFetcher<RepoItem[]>()
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  const actionData = useActionData<ActionData>()
  const errors = actionData?.errors
  const selectRef = useRef<HTMLInputElement>(null)

  const [params] = useSearchParams()
  const defaultRepo = params.get('repo') || undefined

  const debouncedSearchFn = useMemo(
    () => debounce(
      (q: string) => fetcher.load(`/api/search-repo?q=${q}`),
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
        <h2 className="font-medium text-4xl mb-2">Create project</h2>
        <p>This will create a <InlineCode>pressunto.config.json</InlineCode> in the root of your repository</p>
      </header>
      <Form replace method="post">
        <fieldset disabled={busy} className="space-y-6">
          <div>
            <label className={labelCN} htmlFor="title">Title</label>
            <input required name='title' type='text' className={inputCN} />
          </div>
          <div>
            <label className={labelCN} htmlFor="repo">
              GitHub repo (user / repo)
              {" "}
              {errors?.repo ? (
                <span className="text-red-600 dark:text-red-400">{errors.repo}</span>
              ) : null}
            </label>
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
