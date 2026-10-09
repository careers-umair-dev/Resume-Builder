import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Copy, Plus, Trash2 } from 'lucide-react';
import SortableList, { DragHandle } from './SortableList';
import { BulletList, SelectInput, TagInput, TextArea, TextInput, Toggle } from './inputs';
import { ENTRY_SECTIONS } from '../../constants/builder';
import { objectId } from '../../utils/id';
import { normalizeUrl } from '../../utils/validate';

function Fields({ cfg, section, entry, errors, onField }) {
  const err = (k) => errors[`${section}.${entry._id}.${k}`];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cfg.fields.map((f, i) => {
        const span = f.half ? '' : 'sm:col-span-2';
        if (f.type === 'daterange') {
          return (
            <div key={`dr${i}`} className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
              <TextInput label="Start date" type="month" value={entry.startDate} onChange={(e) => onField('startDate', e.target.value)} />
              <TextInput label="End date" type="month" value={entry.endDate} disabled={!!entry.current} error={err('endDate')} onChange={(e) => onField('endDate', e.target.value)} />
              {f.current && <Toggle className="sm:col-span-2" checked={!!entry.current} onChange={(v) => onField('current', v)} label={f.current} />}
            </div>
          );
        }
        const v = entry[f.key];
        const props = { label: f.label, className: span };
        if (f.type === 'textarea') return <TextArea key={f.key} {...props} rows={4} max={f.max} hint={f.hint} value={v} onChange={(e) => onField(f.key, e.target.value)} />;
        if (f.type === 'select') return <SelectInput key={f.key} {...props} options={f.options} value={v} onChange={(x) => onField(f.key, x)} />;
        if (f.type === 'tags') return <TagInput key={f.key} {...props} value={v} max={f.max} tagMax={f.tagMax} placeholder={f.placeholder} onChange={(x) => onField(f.key, x)} />;
        if (f.type === 'bullets') return <div key={f.key} className="sm:col-span-2"><BulletList label={f.label} value={v} onChange={(x) => onField(f.key, x)} /></div>;
        if (f.type === 'url') return <TextInput key={f.key} {...props} type="url" inputMode="url" placeholder="https://" maxLength={300} value={v} error={err(f.key)} onChange={(e) => onField(f.key, e.target.value)} onBlur={(e) => onField(f.key, normalizeUrl(e.target.value))} />;
        return <TextInput key={f.key} {...props} type={f.type === 'month' ? 'month' : 'text'} maxLength={f.max} placeholder={f.placeholder} value={v} error={err(f.key)} onChange={(e) => onField(f.key, e.target.value)} />;
      })}
    </div>
  );
}

export default function EntryListEditor({ section, items, onChange, errors }) {
  const cfg = ENTRY_SECTIONS[section];
  const [open, setOpen] = useState(() => new Set(items.length === 1 ? [items[0]._id] : []));
  const toggle = (id) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const add = () => { const e = { _id: objectId(), ...cfg.blank() }; onChange([...items, e]); setOpen((s) => new Set(s).add(e._id)); };
  const duplicate = (e) => { const copy = { ...JSON.parse(JSON.stringify(e)), _id: objectId() }; const i = items.findIndex((x) => x._id === e._id); const next = [...items]; next.splice(i + 1, 0, copy); onChange(next); setOpen((s) => new Set(s).add(copy._id)); };
  const field = (id, k, v) => onChange(items.map((e) => (e._id === id ? { ...e, [k]: v } : e)), `${section}.${id}.${k}`);

  return (
    <div>
      {items.length === 0 && <p className="mb-3 rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">Nothing here yet.</p>}
      <SortableList items={items} getId={(e) => e._id} onReorder={(next) => onChange(next)}>
        {(e, handle) => {
          const isOpen = open.has(e._id);
          const hasError = Object.keys(errors).some((k) => k.startsWith(`${section}.${e._id}.`));
          return (
            <div className={`rounded-xl border bg-white dark:bg-slate-900 ${hasError ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex items-center gap-1 p-1.5">
                <DragHandle handle={handle} label={`Drag to reorder ${cfg.itemName}`} />
                <button type="button" onClick={() => toggle(e._id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left">
                  <span className={`truncate text-sm font-medium ${cfg.title(e) ? '' : 'text-slate-400'}`}>{cfg.title(e) || `New ${cfg.itemName}`}</span>
                  <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                </button>
                <button type="button" onClick={() => duplicate(e)} aria-label={`Duplicate ${cfg.itemName}`} title="Duplicate" disabled={items.length >= cfg.max} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-800"><Copy className="h-4 w-4" /></button>
                <button type="button" onClick={() => onChange(items.filter((x) => x._id !== e._id))} aria-label={`Delete ${cfg.itemName}`} title="Delete" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" /></button>
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                    <div className="border-t border-slate-100 p-3 dark:border-slate-800"><Fields cfg={cfg} section={section} entry={e} errors={errors} onField={(k, v) => field(e._id, k, v)} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }}
      </SortableList>
      <button type="button" onClick={add} disabled={items.length >= cfg.max} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:text-brand-300"><Plus className="h-4 w-4" />{cfg.addLabel}</button>
    </div>
  );
}
