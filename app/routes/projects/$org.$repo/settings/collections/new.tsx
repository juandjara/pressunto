import Modal from "@/components/Modal"
import { buttonCN, inputCN, labelCN } from "@/lib/styles"
import { Form, useNavigate } from "@remix-run/react"

export default function NewCollection() {
  const navigate = useNavigate()

  function closeModal() {
    navigate('..')
  }

  return (
    <Modal open onClose={closeModal} title="New Collection">
      <Form replace method="post" className="space-y-4 mt-4">
        <div>
          <label htmlFor="name" className={labelCN}>Name</label>
          <input name="name" type="text" className={inputCN} />
        </div>
        <div>
          <label htmlFor="route" className={labelCN}>Route</label>
          <input name="route" type="text" className={inputCN} />
        </div>
        <div>
          <label htmlFor="template" className={labelCN}>Template</label>
          <input name="template" type="text" className={inputCN} />
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
