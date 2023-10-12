import FileTree from "@/components/source-files/FileTree"
import { useRepoTree } from "@/lib/useProjectConfig"

export default function ProjectSource() {
  const tree = useRepoTree()
  return (
    <div className="p-4">
      <h2 className="font-medium text-4xl text-slate-500 dark:text-slate-300 mt-4 mb-2">
        Source Code
      </h2>
      <p className="text-lg">
        Here you can browse and edit all the code for this project, using a basic editor not focused on Markdown content
      </p>
      <div className="py-6">
        <FileTree tree={tree} />
      </div>
    </div>
  )
}
