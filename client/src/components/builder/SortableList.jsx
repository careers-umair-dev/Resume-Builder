import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function DragHandle({ handle, label = 'Drag to reorder' }) {
  return (
    <button type="button" ref={handle.setActivatorNodeRef} {...handle.attributes} {...handle.listeners} aria-label={label} title={label}
      className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-slate-800">
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

function Item({ id, children }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 20 : undefined, position: 'relative' }} className={isDragging ? 'opacity-90 shadow-paper' : ''}>
      {children({ attributes, listeners, setActivatorNodeRef })}
    </li>
  );
}

export default function SortableList({ items, getId, onReorder, children, className = 'space-y-2' }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = items.map(getId);
  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(items, ids.indexOf(active.id), ids.indexOf(over.id)));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={className}>{items.map((it) => <Item key={getId(it)} id={getId(it)}>{(handle) => children(it, handle)}</Item>)}</ul>
      </SortableContext>
    </DndContext>
  );
}
