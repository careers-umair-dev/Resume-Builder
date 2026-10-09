import SortableList, { DragHandle } from './SortableList';
import { Toggle } from './inputs';
import { SECTION_META } from '../../constants/builder';

export default function SectionsManager({ order, enabled, onReorder, onToggle }) {
  return (
    <div>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Turn sections on or off and drag to change the order they appear in your resume.</p>
      <SortableList items={order} getId={(k) => k} onReorder={onReorder} className="space-y-1.5">
        {(key, handle) => {
          const { label, icon: Icon } = SECTION_META[key];
          return (
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-900">
              <DragHandle handle={handle} label={`Drag to reorder ${label}`} />
              <Icon className="h-4 w-4 text-slate-400" aria-hidden />
              <span className={`flex-1 px-1 text-sm ${enabled.has(key) ? 'font-medium' : 'text-slate-400'}`}>{label}</span>
              <Toggle checked={enabled.has(key)} onChange={() => onToggle(key)} />
              <span className="sr-only">{`Show ${label}`}</span>
            </div>
          );
        }}
      </SortableList>
    </div>
  );
}
