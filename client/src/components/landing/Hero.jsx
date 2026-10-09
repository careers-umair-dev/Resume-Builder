import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Button from '../common/Button';
import TemplateThumb from '../common/TemplateThumb';
import { useAuth } from '../../hooks/useAuth';

const POINTS = ['6 professionally designed templates', 'Live preview while you type', 'One-click PDF export'];

export default function Hero() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-gradient-to-b from-brand-50 to-transparent dark:from-brand-900/20" aria-hidden />
      <div className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="mb-4 inline-flex items-center rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-300">Made for interns and early-career developers</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">Build a Resume That Gets You Noticed.</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">Pick a template, add your experience once, and see your resume update as you type. Customize the look, then download a clean, print-ready PDF.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={isAuthenticated ? '/dashboard' : '/register'} size="lg">Create Your Resume <ArrowRight className="h-4 w-4" aria-hidden /></Button>
            <Button to={{ pathname: '/', hash: '#templates' }} variant="secondary" size="lg">Explore Templates</Button>
          </div>
          <ul className="mt-8 space-y-2">
            {POINTS.map((p) => <li key={p} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Check className="h-4 w-4 text-emerald-600" aria-hidden />{p}</li>)}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative mx-auto w-full max-w-md" aria-hidden>
          <div className="card p-4">
            <div className="mb-3 flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
            <div className="grid grid-cols-[1fr_1.25fr] gap-3">
              <div className="space-y-2.5 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                {['Full name', 'Title', 'Email', 'Summary'].map((l, i) => (
                  <div key={l}><div className="mb-1 h-1.5 w-1/3 rounded bg-slate-300 dark:bg-slate-600" /><div className={`rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${i === 3 ? 'h-12' : 'h-5'}`} /></div>
                ))}
              </div>
              <TemplateThumb variant="banner" />
            </div>
          </div>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} className="absolute -bottom-5 -left-3 hidden w-28 sm:block"><TemplateThumb variant="sidebar" color="#0f766e" /></motion.div>
        </motion.div>
      </div>
    </section>
  );
}
