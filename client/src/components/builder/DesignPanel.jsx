import { useId } from 'react';
import { LayoutTemplate, RotateCcw } from 'lucide-react';
import { COLOR_SWATCHES, DEFAULT_CUSTOMIZATION, DENSITIES, FONT_OPTIONS, HEADING_STYLES, PHOTO_STYLES, PRESETS } from '../../constants/builder';
import { TEMPLATES } from '../../constants/app';

function Group({ title, children }) {
  return <section className="card p-4"><h3 className="mb-3 text-sm font-semibold">{title}</h3><div className="space-y-4">{children}</div></section>;
}

function Range({ label, value, min, max, step, unit = '', onChange, format }) {
  const id = useId();
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between"><label htmlFor={id} className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label><span className="text-xs tabular-nums text-slate-500">{format ? format(value) : value}{unit}</span></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-brand-600" />
    </div>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${value === o.value ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</label>
      <div className="flex items-center gap-2">
        <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" />
        <input aria-label={`${label} hex value`} value={value} maxLength={7} onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && onChange(e.target.value.toLowerCase())} onBlur={(e) => { e.target.value = value; }} key={value}
          className="h-9 w-24 rounded-lg border border-slate-300 bg-white px-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900" />
        <div className="flex flex-wrap gap-1">
          {COLOR_SWATCHES.map((c) => <button key={c} type="button" onClick={() => onChange(c)} aria-label={`Use ${c}`} title={c} className={`h-6 w-6 rounded-full border-2 ${value === c ? 'border-slate-900 dark:border-white' : 'border-white dark:border-slate-900'} shadow-sm ring-1 ring-slate-200 dark:ring-slate-700`} style={{ background: c }} />)}
        </div>
      </div>
    </div>
  );
}

export default function DesignPanel({ draft, onTemplate, onCustom, onPreset, onReset }) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...draft.customization };
  const tpl = TEMPLATES.find((t) => t.id === draft.template) || TEMPLATES[0];
  return (
    <div className="space-y-3">
      <Group title="Template">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0"><p className="truncate font-medium">{tpl.name}</p><p className="truncate text-xs text-slate-500 dark:text-slate-400">{tpl.blurb}</p></div>
          <button type="button" onClick={onTemplate.open} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700"><LayoutTemplate className="h-4 w-4" aria-hidden />Change</button>
        </div>
      </Group>

      <Group title="Presets">
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Style presets">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={c.preset === p.id} onClick={() => onPreset(p)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${c.preset === p.id ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200' : 'border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}`}>
              <span className="h-3 w-3 rounded-full" style={{ background: p.values.primaryColor }} aria-hidden />{p.label}
            </button>
          ))}
        </div>
        {c.preset === 'custom' && <p className="text-xs text-slate-500">Custom settings. Pick a preset to start over from one.</p>}
      </Group>

      <Group title="Colors">
        <ColorField label="Primary color" value={c.primaryColor} onChange={(v) => onCustom({ primaryColor: v })} />
        <ColorField label="Accent color" value={c.accentColor} onChange={(v) => onCustom({ accentColor: v })} />
        <p className="text-xs text-slate-500 dark:text-slate-400">The Compact ATS template stays monochrome so parsers read it cleanly.</p>
      </Group>

      <Group title="Typography">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300" htmlFor="font-family">Font family</label>
          <select id="font-family" value={c.fontFamily} onChange={(e) => onCustom({ fontFamily: e.target.value })} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
            {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <Range label="Font size" value={c.fontSize} min={8} max={14} step={0.5} unit=" pt" onChange={(v) => onCustom({ fontSize: v })} />
        <Range label="Line spacing" value={c.lineSpacing} min={1} max={2} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => onCustom({ lineSpacing: v })} />
        <Segmented label="Heading style" value={c.headingStyle} options={HEADING_STYLES} onChange={(v) => onCustom({ headingStyle: v })} />
      </Group>

      <Group title="Layout & spacing">
        <Range label="Section spacing" value={c.sectionSpacing} min={6} max={40} step={1} unit=" pt" onChange={(v) => onCustom({ sectionSpacing: v })} />
        <Range label="Page margins" value={c.margins} min={20} max={80} step={2} unit=" pt" onChange={(v) => onCustom({ margins: v })} />
        <Segmented label="Layout density" value={c.density} options={DENSITIES} onChange={(v) => onCustom({ density: v })} />
        <Segmented label="Profile image style" value={c.photoStyle} options={PHOTO_STYLES} onChange={(v) => onCustom({ photoStyle: v })} />
      </Group>

      <button type="button" onClick={onReset} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw className="h-4 w-4" aria-hidden />Reset customization</button>
    </div>
  );
}
