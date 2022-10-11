import Modal from "@/components/Modal"
import { buttonCN, inputCN, labelCN } from "@/lib/styles"
import { Form, useNavigate } from "@remix-run/react"

export default function NewTemplate() {
  const navigate = useNavigate()

  function closeModal() {
    navigate('..')
  }

  return (
    <Modal open onClose={closeModal} title="New Template">
      <Form replace method="post" className="space-y-4">
        <div>
          <label htmlFor="name" className={labelCN}>Name</label>
          <input name="name" type="text" className={inputCN} />
        </div>
        <button
          type="submit"
          className={`${buttonCN.slate} ${buttonCN.normal}`}>
          Save
        </button>
        <button
          type="button"
          onClick={closeModal}
          className={`${buttonCN.normal} ml-3 hover:bg-slate-100 dark:hover:bg-slate-100/25`}>
          Cancel
        </button>
      </Form>
    </Modal>
  )
}
