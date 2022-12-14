import { getFileContent, saveFile } from "@/lib/github"
import metaTitle from "@/lib/metaTitle"
import { CONFIG_FILE_NAME, deleteProject, updateProject } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import { buttonCN, checkboxCN, inputCN, labelCN } from "@/lib/styles"
import useProjectConfig, { useProject } from "@/lib/useProjectConfig"
import { PlusIcon } from "@heroicons/react/20/solid"
import type { ActionFunction} from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, Link, Outlet, useTransition } from "@remix-run/react"

export const action: ActionFunction = async ({ request, params }) => {
  const { token, user } = await requireUserSession(request)
  const repo = `${params.org}/${params.repo}`
  const formData = await request.formData()
  const op = formData.get('operation')
  const delete_config_file = formData.get('delete_config_file') === 'on'
  const branch = formData.get('branch') as string
  const isDelete = op === 'delete'

  let flashMessage = ''

  if (op === 'update') {
    const title = formData.get('title') as string
    await updateProject(user.name, {
      repo,
      branch,
      title
    })

    flashMessage = 'Project updated successfully'
  }

  if (op === 'delete') {
    await deleteProject(user.name, repo)
    if (delete_config_file) {
      const file = await getFileContent(token, {
        repo,
        file: CONFIG_FILE_NAME,
        branch
      })
  
      if (file) {
        await saveFile(token, {
          repo,
          branch,
          message: '[skip ci] Delete config file for Pressunto',
          method: 'DELETE',
          sha: file?.sha,
          path: CONFIG_FILE_NAME,
          name: '',
          content: file.content
        })
      }
    }

    flashMessage = 'Project deleted successfully'
  }

  const headers = new Headers({
    'cache-control': 'no-cache',
    'Set-Cookie': await setFlashMessage(request, flashMessage)
  })

  return redirect(isDelete ? '/' : `/projects/${repo}/settings`, { headers })
}

export const meta = {
  title: metaTitle('Settings')
}

const groupCN = 'py-2'
const listCN = [
  'flex items-center pl-4 p-2 rounded-md text-lg',
  'bg-slate-100 dark:bg-slate-700'
].join(' ')

export default function ProjectSettings() {
  const config = useProjectConfig()

  return (
    <div className="p-4 space-y-8">
      <Outlet />
      <div>
        <h2 className="font-medium text-4xl my-4">Settings</h2>
        <p className="max-w-prose font-medium">
          Here you can edit the configuration for your project, how content is organized and what defaults field are added to every content collection 
        </p>
      </div>
      <div>
        <header className="flex items-end justify-between mb-1">
          <div>
            <h3 className="font-medium text-2xl mb-2">Collections</h3>
            <details>
              <summary className="text-slate-700 dark:text-slate-300 mb-2">What is this?</summary>
              <p>
                Collections map to folders in your repository.
                <br />
                Every collection you define will be showed in the left sidebar.
                <br />
                Every collection you define will list the markdown files of that folder as posts, but not the ones in subfolders.
              </p>
            </details>
          </div>
          <Link to='collections/new'>
            <button
              type="button"
              title="Create new collection"
              aria-label="Create new collection"
              className="flex items-center gap-2 ml-2 pl-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-100/25">
              <span>New</span>
              <PlusIcon className="w-6 h-6" />
            </button>
          </Link>
        </header>
        <div className={groupCN}>
          {config.collections.length === 0 && (
            <p>You don't have any saved collection.</p>
          )}
          <ul className="space-y-4">
            {config.collections.map((c) => (
              <li key={c.id} className={listCN}>
                <Link to={`collections/${c.id}`} className="flex-grow">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <header className="flex items-end justify-between gap-3 mb-1">
          <div>
            <h3 className="font-medium text-2xl mb-2">Templates</h3>
            <details>
              <summary className="text-slate-700 dark:text-slate-300 mb-2">What is this?</summary>
              <p>
                Templates are a predefined set of fields you can add to any content collection.
                <br />
                Adding a template to a collection will add all the fields that are not already present there to every post of the collection
              </p>
            </details>
          </div>
          <Link to='templates/new'>
            <button
              type="button"
              title="Create new template"
              aria-label="Create new template"
              className="flex items-center gap-2 ml-2 pl-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-100/25">
              <span>New</span>
              <PlusIcon className="w-6 h-6" />
            </button>
          </Link>
        </header>
        <div className={groupCN}>
          {config.templates.length === 0 && (
            <p>You don't have any saved template.</p>
          )}
          <ul className="space-y-4">
            {config.templates.map((t) => (
              <li key={t.id} className={listCN}>
                <Link to={`templates/${t.id}`} className="flex-grow">{t.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <EditProject />
      <DangerZone />
    </div>
  )
}

function EditProject() {
  const project = useProject()
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  return (
    <Form method='post' replace className="space-y-4">
      <h3 className="font-medium text-xl mb-1">Project</h3>
      <div>
        <label className={labelCN}>Title</label>
        <input required type="text" name="title" defaultValue={project.title} className={inputCN} />
      </div>
      <div>
        <label className={labelCN}>Branch</label>
        <input type="text" name="branch" defaultValue={project.branch} placeholder="master" className={inputCN} />
      </div>
      <button
        name="operation"
        value="update"
        type="submit"
        disabled={busy}
        className={`${buttonCN.normal} ${buttonCN.slate}`}>
        {busy ? 'Saving...' : 'Save'}
      </button>
    </Form>
  )
}

function DangerZone() {
  const project = useProject()
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  function handleSubmit(ev: React.MouseEvent) {
    if (!window.confirm('??Are you sure you want to delete this project?')) {
      ev.preventDefault()
    }
  }

  return (
    <div className="pt-4">
      <h3 className="font-medium text-xl mb-1">Danger zone</h3>
      <Form method="post" className="mt-4">
        <input type='hidden' name='branch' value={project.branch || 'master'} />
        <label className="mb-4 flex items-center dark:text-slate-300 text-slate-600">
          <input
            name="delete_config_file"
            type="checkbox"
            className={`mr-2 ${checkboxCN}`}
          />
          Delete config file in repository
        </label>
        <button
          name="operation"
          value="delete"
          type="submit"
          disabled={busy}
          onClick={handleSubmit}
          className={`${buttonCN.normal} bg-red-700 hover:bg-red-800 text-white`}>
          Delete Project
        </button>
      </Form>
    </div>
  )
}
