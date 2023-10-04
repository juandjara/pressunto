import { ComboBoxLocal } from "@/components/ComboBoxLocal"
import type { TreeItem} from "@/lib/github"
import { getRepoFiles } from "@/lib/github"
import metaTitle from "@/lib/metaTitle"
import { getProject, getProjectConfig, updateConfigFile } from "@/lib/projects.server"
import { deleteConfigFile, deleteProject, updateProject } from "@/lib/projects.server"
import { requireUserSession, setFlashMessage } from "@/lib/session.server"
import { buttonCN, checkboxCN, iconCN, inputCN, labelCN } from "@/lib/styles"
import useProjectConfig, { useProject } from "@/lib/useProjectConfig"
import { DocumentDuplicateIcon, ListBulletIcon, PlusIcon } from "@heroicons/react/20/solid"
import type { ActionFunction, LoaderArgs} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, Outlet, useLoaderData, useTransition } from "@remix-run/react"
import clsx from "clsx"

export const meta = {
  title: metaTitle('Settings')
}

export const action: ActionFunction = async ({ request, params }) => {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const config = await getProjectConfig(token, project)
  const formData = await request.formData()
  const delete_config_file = formData.get('delete_config_file') === 'on'
  const op = formData.get('operation')
  const isDelete = op === 'delete'
  const branch = formData.get('branch') as string
  const title = formData.get('title') as string
  const mediaFolder = formData.get('mediaFolder') as string

  let flashMessage = ''

  if (op === 'update') {
    const shouldUpdateProject = branch !== project.branch || title !== project.title
    const shouldUpdateConfig = config.mediaFolder !== mediaFolder

    await Promise.all([
      shouldUpdateProject
        ? updateProject({ ...project, branch, title })
        : Promise.resolve(null),
      shouldUpdateConfig
        ? updateConfigFile(token, project, { ...config, mediaFolder })
        : Promise.resolve(null)
    ])

    flashMessage = 'Project updated successfully'
  }

  if (op === 'delete') {
    await deleteProject(project)
    if (delete_config_file) {
      await deleteConfigFile(token, project)
    }

    flashMessage = 'Project deleted successfully'
  }

  const headers = new Headers({
    'cache-control': 'no-cache',
    'Set-Cookie': await setFlashMessage(request, flashMessage)
  })

  return redirect(isDelete ? '/' : `/p/${project.id}/settings`, { headers })
}

export async function loader({ params, request }: LoaderArgs) {
  const { token } = await requireUserSession(request)
  const project = await getProject(Number(params.project))
  const tree = await getRepoFiles(token, project.repo, project.branch)
  tree.unshift({
    path: '/',
    type: 'tree' as const,
    url: '',
    mode: '',
    sha: '',
  })

  return json({ tree: tree.filter((t) => t.type === 'tree') })
}

const listCN = 'flex items-center gap-2 p-2 pr-1 rounded-md bg-slate-100 dark:bg-slate-700'

export default function ProjectSettings() {
  const { tree } = useLoaderData<typeof loader>()
  const config = useProjectConfig()

  return (
    <div className="p-4">
      <Outlet />
      <header>
        <h2 className="font-medium text-4xl text-slate-500 dark:text-slate-300 mt-4 mb-2">
          Settings
        </h2>
        <p className="max-w-prose font-medium">
          Here you can edit the configuration for your project, how content is organized and what defaults field are added to every collection 
        </p>
      </header>
      <main className="space-y-8 mt-12">
        <section>
          <header className="flex items-end justify-between mb-2">
            <h3 className="text-slate-500 dark:text-slate-300 font-medium text-2xl">Collections</h3>
            <Link to='collections/new'>
              <button
                type="button"
                title="Create new collection"
                aria-label="Create new collection"
                className={`${buttonCN.small} ${buttonCN.slate} ${buttonCN.iconRight}`}>
                <span>New</span>
                <PlusIcon className="w-6 h-6" />
              </button>
            </Link>
          </header>
          <details>
            <summary className="text-slate-700 dark:text-slate-300 mb-2 cursor-pointer">What are collections?</summary>
            <ul className="max-w-prose mb-2 list-disc ml-7">
              <li>Collections define groups of posts in your project that can be used to organize your content.</li>
              <li>They are defined by a <strong>name</strong>, a <strong>folder</strong> path in the repo and a <strong>template</strong>.</li>
              <li>Every collection can have a list of default fields called a <strong>template</strong> that will be asigned to every new post.</li>
              <li>Every collection will list the markdown files in the folder as posts, not including subfolders.</li>
              <li>Posts for a collection can accessed in the upper area of the left sidebar.</li>
            </ul>
          </details>
          <div className="pb-6 pt-1">
            {config.collections.length === 0 && (
              <p>You don't have any saved collection.</p>
            )}
            <ul className="space-y-4 mt-2">
              {config.collections.map((c) => (
                <li key={c.id} className={listCN}>
                  <DocumentDuplicateIcon className={iconCN.big} />
                  <Link to={`collections/${c.id}`} className="text-slate-600 dark:text-slate-200 text-lg flex-grow">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section>
          <header className="flex items-end justify-between gap-3 mb-2">
            <h3 className="text-slate-500 dark:text-slate-300 font-medium text-2xl">Templates</h3>
            <Link to='templates/new'>
              <button
                type="button"
                title="Create new template"
                aria-label="Create new template"
                className={`${buttonCN.small} ${buttonCN.slate} ${buttonCN.iconRight}`}>
                <span>New</span>
                <PlusIcon className="w-6 h-6" />
              </button>
            </Link>
          </header>
          <details>
            <summary className="text-slate-700 dark:text-slate-300 mb-2 cursor-pointer">What are templates?</summary>
            <ul className="max-w-prose mb-2 list-disc ml-7">
              <li>Templates are lists of default fields that are assigned to all posts of a collection.</li>
              <li>They are defined by a <strong>name</strong> and a list of <strong>fields</strong>.</li>
              <li>The <strong>label</strong> of the field is the label that will be displayed in the editor. If left blank, the key will be used instead.</li>
              <li>The <strong>key</strong> of the field is the key used at the top of the markdown file to hold data for this field.</li>
              <li>The <strong>default value</strong> of the field is the value that will be assigned to the field when a new post is created.</li>
              <li>The <strong>hidden</strong> check can be used if you want to keep a field in your markdown files but don't want it to be shown in the editor.</li>
              <li>Whenever a post that uses a template is saved, the fields in the template will be added to the top of the markdown file if they are not already present.</li>
            </ul>
          </details>
          <div className="pb-6 pt-1">
            {config.templates.length === 0 && (
              <p>You don't have any saved template.</p>
            )}
            <ul className="space-y-4 mt-2">
              {config.templates.map((t) => (
                <li key={t.id} className={listCN}>
                  <ListBulletIcon className={iconCN.big} />
                  <Link to={`templates/${t.id}`} className="text-slate-600 dark:text-slate-200 text-lg flex-grow">{t.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <EditProject tree={tree} />
        <DangerZone />
      </main>
    </div>
  )
}

function EditProject({ tree }: { tree: TreeItem[] }) {
  const project = useProject()
  const config = useProjectConfig()
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  return (
    <section>
      <h3 className="text-slate-500 dark:text-slate-300 font-medium text-2xl mb-4">Project</h3>
      <Form method='post' replace className="space-y-6">
        <div>
          <label className={labelCN}>Title</label>
          <input required type="text" name="title" defaultValue={project.title} className={inputCN} />
        </div>
        <div>
          <label className={labelCN}>Branch</label>
          <input type="text" name="branch" defaultValue={project.branch} placeholder="master" className={inputCN} />
        </div>
        <div>
          <label htmlFor="mediaFolder" className={labelCN}>Media folder</label>
          <ComboBoxLocal<TreeItem>
            name='mediaFolder'
            options={tree}
            labelKey='path'
            valueKey='path'
            defaultValue={config.mediaFolder || '/'}
          />
          <p className="text-slate-400 text-sm mt-1">
            This is the folder where your media files (images and other binary files) will be stored.
            If you don't specify a folder, all media files will be stored in the root of your repository.
          </p>
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
    </section>
  )
}

function DangerZone() {
  const project = useProject()
  const transition = useTransition()
  const busy = transition.state === 'submitting'

  function handleSubmit(ev: React.MouseEvent) {
    if (!window.confirm('¿Are you sure you want to delete this project?')) {
      ev.preventDefault()
    }
  }

  return (
    <section className="pt-6">
      <h3 className="text-slate-500 dark:text-slate-300 font-medium text-2xl mb-2">Danger zone</h3>
      <Form method="post" className="mt-4">
        <input type='hidden' name='branch' value={project.branch || 'master'} />
        <label className="mb-4 flex items-center dark:text-slate-300 text-slate-600 gap-2">
          <input
            name="delete_config_file"
            type="checkbox"
            className={checkboxCN}
          />
          <span>Delete config file</span>
          <code>pressunto.config.json</code>
          <span>in repository</span>
        </label>
        <button
          name="operation"
          value="delete"
          type="submit"
          disabled={busy}
          onClick={handleSubmit}
          className={clsx(buttonCN.normal, buttonCN.deleteBold)}>
          Delete Project
        </button>
      </Form>
    </section>
  )
}
