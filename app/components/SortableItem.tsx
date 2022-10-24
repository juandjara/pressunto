import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type SortableItemProps = {
  id: string
  isActive: boolean
  children: React.ReactNode
}

export default function SortableItem({ id, isActive, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isActive ? 0 : 1,
    pointerEvents: isActive ? 'none' : undefined,
    userSelect: 'none',
  }

  return (
    <li ref={setNodeRef} style={style} {...listeners} {...attributes}>{children}</li>
  )
}
