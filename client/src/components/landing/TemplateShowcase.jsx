import { motion } from 'framer-motion';
import TemplateThumb from '../common/TemplateThumb';
import Button from '../common/Button';
import { TEMPLATES } from '../../constants/app';
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#2563eb', '#0f172a', '#0f766e', '#7c3aed', '#111827', '#9a3412'];

export default function TemplateShowcase() {
  const { isAuthenticated } = useAuth();
  return (
    <section id="templates" className="scroll-mt-20 py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Templates with real personality</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">Each one has its own layout, typography and hierarchy, not just a different color.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:gap-8">
          {TEMPLATES.map((t, i) => (
            <motion.figure key={t.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 3) * 0.06, duration: 0.35 }} whileHover={{ y: -4 }} className="group">
              <TemplateThumb variant={t.variant} color={COLORS[i]} />
              <figcaption className="mt-3"><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{t.blurb}</p></figcaption>
            </motion.figure>
          ))}
        </div>
        <div className="mt-12 text-center"><Button to={isAuthenticated ? '/dashboard' : '/register'} size="lg">Start with a template</Button></div>
      </div>
    </section>
  );
}
