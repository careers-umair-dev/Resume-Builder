import { Check } from 'lucide-react';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import PageTransition from './PageTransition';

const POINTS = ['Six distinct, professional templates', 'Live A4 preview as you type', 'Auto-save and one-click PDF export'];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 p-12 text-white lg:flex">
        <Logo light />
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight">Build a resume that gets you noticed.</h2>
          <ul className="mt-8 space-y-3">{POINTS.map((p) => <li key={p} className="flex items-center gap-3 text-brand-100"><Check className="h-5 w-5 shrink-0" aria-hidden />{p}</li>)}</ul>
        </div>
        <p className="text-sm text-brand-200">Free to use. Your resumes stay private to your account.</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" aria-hidden />
      </aside>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6"><span className="lg:hidden"><Logo /></span><span className="ml-auto"><ThemeToggle /></span></div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <PageTransition>
            <div className="w-full max-w-sm">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
              <div className="mt-8">{children}</div>
              <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</div>
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}
