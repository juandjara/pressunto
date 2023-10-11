import { Form, Link, useActionData, useFetcher, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react"
import { buttonCN, inputCN, labelCN } from '@/lib/styles'
import ComboBox from "@/components/ComboBox"
import { getOrgs, validateBranch } from "@/lib/github"
import { useEffect, useMemo, useRef, useState } from "react"
import debounce from 'debounce'
import type { ActionFunction, LoaderArgs} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { requireUserSession } from "@/lib/session.server"
import { createConfigFile, createProject, getIdForRepo } from "@/lib/projects.server"
import InlineCode from "@/components/InlineCode"
import metaTitle from "@/lib/metaTitle"
import type { RepoItem } from "@/lib/github.search"

const DEBOUNCE_TIME = 300

export const meta = {
  title: metaTitle('New Project')
}

type ActionData = undefined | { errors: { org: string; repo: string; branch: string } }

export const action: ActionFunction = async ({ request }) => {
  const { user, token } = await requireUserSession(request)
  const formData = await request.formData()
  const title = formData.get('title') as string
  const org = formData.get('org') as string
  const repo = formData.get('repo') as string
  const branch = formData.get('branch') as string

  const errors = []

  if (!org) {
    errors.push(['org', 'This field is required'])
  }
  if (!repo) {
    errors.push(['repo', 'This field is required'])
  }

  const branchIsValid = await validateBranch(token, repo, branch)
  if (!branchIsValid) {
    errors.push(['branch', `Branch "${branch}" does not exist`])
  }

  if (errors.length) {
    return json({ errors: Object.fromEntries(errors) })
  }

  const existingProject = await getIdForRepo(`${org}/${repo}`)
  if (existingProject) {
    return redirect(`/p/${existingProject}`)
  }

  const project = { user: user.name, repo: `${org}/${repo}`, branch, title }
  const [id] = await Promise.all([
    createProject(project),
    createConfigFile(token, project.repo, project.branch)
  ])

  return redirect(`/p/${id}`)
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
  const navigation = useNavigation()
  const busy = navigation.state !== 'idle'
  const actionData = useActionData<ActionData>()
  const errors = actionData?.errors
  const repoSelectRef = useRef<HTMLInputElement>(null)
  const orgSelectRef = useRef<HTMLSelectElement>(null)
  const [selectedRepo, setSelectedRepo] = useState<RepoItem>()

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

  // fetch repos on mount for default org
  useEffect(() => {
    if (!fetcher.data && fetcher.state === 'idle') {
      const org = orgSelectRef.current?.value
      fetcher.load(`/api/search-repo?q=&org=${org}`)
    }
  }, [fetcher])

  useEffect(() => {
    if (errors?.repo && repoSelectRef.current) {
      repoSelectRef.current.focus()
    }
  }, [errors])

  function onSelectedRepo(opt: string) {
    const repo = fetcher.data?.find(d => d.name == opt)
    setSelectedRepo(repo)
  }

  return (
    <div className="px-3 pt-8 pb-4 max-w-screen-md">
      <header className="mb-8">
        <h2 className="font-medium text-4xl mb-3">New project</h2>
        <p>This will create a <InlineCode>pressunto.config.json</InlineCode> in the root of your repository</p>
      </header>
      <Form replace method="post">
        <fieldset disabled={busy} className="space-y-8">
          <div>
            <label className={labelCN} htmlFor="repo">GitHub repo</label>
            <div className="flex items-center gap-2">
              <select ref={orgSelectRef} name="org" className={inputCN} style={{ flexBasis: '150px' }}>
                <option value={user}>{user}</option>
                {orgs.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <div className="flex-grow">
                <ComboBox<RepoItem>
                  inputRef={repoSelectRef}
                  name='repo'
                  loading={fetcher.state === 'loading'}
                  options={(fetcher.data || [])}
                  onSearch={debouncedSearchFn}
                  labelKey='name'
                  valueKey='name'
                  defaultValue={defaultRepo}
                  onSelect={onSelectedRepo}
                />
              </div>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-xs mb-1">
                This search field will only list the repositories where you can push code
              </p>
              {errors?.repo ? (
                <p className="text-sm mb-1 text-red-600 dark:text-red-400">{errors.repo}</p>
              ) : null}
            </div>
          </div>
          <div>
            <label className={labelCN} htmlFor="branch">Branch</label>
            <input
              defaultValue={selectedRepo?.default_branch}
              placeholder={selectedRepo?.default_branch}
              className={inputCN}
              name='branch'
              type='text'
              required
            />
            <div className="mt-2 flex items-end justify-between">
              <p className="text-xs mb-1">
                The main branch that will be used to fetch and update content
              </p>
              {errors?.branch ? (
                <p className="text-sm mb-1 text-red-600 dark:text-red-400">{errors.branch}</p>
              ) : null}
            </div>
          </div>
          <div>
            <label className={labelCN} htmlFor="title">Project Title</label>
            <input
              defaultValue={selectedRepo?.name}
              placeholder={selectedRepo?.name}
              className={inputCN}
              name='title'
              type='text'
              required
            />
          </div>
        </fieldset>
        <div className="space-x-3 mt-12">
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
