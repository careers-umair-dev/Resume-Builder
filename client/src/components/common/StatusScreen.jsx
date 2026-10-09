import { motion } from 'framer-motion';

/** Full-page message used by 404, unauthorized and network-error states. */
export default function StatusScreen({ icon: Icon, title, message, children, tone = 'brand' }) {
  const tones = { brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300', red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300', amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-7 w-7" aria-hidden /></div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
    </motion.div>
  );
}
