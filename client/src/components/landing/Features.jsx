import { motion } from 'framer-motion';
import { FileDown, Gauge, LayoutTemplate, Eye, Palette, Save } from 'lucide-react';

const FEATURES = [
  { icon: LayoutTemplate, title: 'Professional Templates', text: 'Six distinct layouts, from a bold banner to a dense ATS-friendly page.' },
  { icon: Eye, title: 'Live Preview', text: 'See an A4 preview update instantly as you edit.' },
  { icon: Palette, title: 'Easy Customization', text: 'Change colors, fonts, spacing and margins without breaking the layout.' },
  { icon: FileDown, title: 'One-Click PDF Export', text: 'Download a crisp, multi-page PDF that matches your preview.' },
  { icon: Save, title: 'Auto Save', text: 'Your work is saved as you go, so nothing gets lost.' },
  { icon: Gauge, title: 'Resume Completion', text: 'A score and clear suggestions show what to add next.' },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need, nothing you don’t</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">Focused tools that help you finish a strong resume quickly.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.05, duration: 0.35 }} className="card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"><Icon className="h-5 w-5" aria-hidden /></div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
