import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import SortableList, { DragHandle } from './SortableList';
import { SelectInput, TagInput, TextInput } from './inputs';
import { SKILL_CATEGORIES, SKILL_LEVELS } from '../../constants/builder';
import { objectId } from '../../utils/id';

const MAX = 100;

export default function SkillsForm({ items, onChange }) {
  const [focusId, setFocusId] = useState(null);
  const patch = (id, k, v) => onChange(items.map((s) => (s._id === id ? { ...s, [k]: v } : s)), `skills.${id}.${k}`);
  const add = () => { const s = { _id: objectId(), name: '', category: '', level: '', tags: [] }; setFocusId(s._id); onChange([...items, s]); };
  return (
    <div>
      <datalist id="skill-categories">{SKILL_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
      {items.length === 0 && <p className="mb-3 rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">Add at least 3 skills. Group them by category to keep your resume scannable.</p>}
      <SortableList items={items} getId={(s) => s._id} onReorder={(n) => onChange(n)}>
        {(s, handle) => (
          <div className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start gap-1">
              <div className="pt-1"><DragHandle handle={handle} label="Drag to reorder skill" /></div>
              <div className="grid flex-1 gap-2 sm:grid-cols-[1.4fr_1fr_1fr]">
                <TextInput label="Skill" hideLabel placeholder="Skill (e.g. React)" maxLength={80} autoFocus={focusId === s._id} value={s.name} onChange={(e) => patch(s._id, 'name', e.target.value)} />
                <TextInput label="Category" hideLabel placeholder="Category" list="skill-categories" maxLength={60} value={s.category} onChange={(e) => patch(s._id, 'category', e.target.value)} />
                <SelectInput label="Level" hideLabel placeholder="Level" options={SKILL_LEVELS} value={s.level} onChange={(v) => patch(s._id, 'level', v)} />
                <div className="sm:col-span-3"><TagInput label="Tags" hideLabel value={s.tags} max={20} placeholder="Related tags (optional)" onChange={(v) => patch(s._id, 'tags', v)} /></div>
              </div>
              <button type="button" onClick={() => onChange(items.filter((x) => x._id !== s._id))} aria-label="Remove skill" title="Remove" className="mt-1 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </SortableList>
      <button type="button" onClick={add} disabled={items.length >= MAX} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"><Plus className="h-4 w-4" />Add skill</button>
    </div>
  );
}
