import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function SectionCard({ id, title, icon: Icon, badge, open, onToggle, children }) {
  return (
    <section id={`section-${id}`} className="card scroll-mt-16">
      <h2>
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`panel-${id}`} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"><Icon className="h-4 w-4" aria-hidden /></span>
          <span className="flex-1 font-semibold">{title}</span>
          {badge != null && badge !== '' && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{badge}</span>}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={`panel-${id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
