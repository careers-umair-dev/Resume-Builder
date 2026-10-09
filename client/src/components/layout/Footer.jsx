import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { APP_NAME } from '../../constants/app';

const COLUMNS = [
  { title: 'Product', links: [{ label: 'Features', to: { pathname: '/', hash: '#features' } }, { label: 'Templates', to: { pathname: '/', hash: '#templates' } }, { label: 'How it works', to: { pathname: '/', hash: '#how-it-works' } }] },
  { title: 'Company', links: [{ label: 'About', to: '/about' }, { label: 'Contact', to: '/contact' }] },
  { title: 'Legal', links: [{ label: 'Privacy', to: '/privacy' }, { label: 'Terms', to: '/terms' }] },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-600 dark:text-slate-400">Build, customize and export professional resumes in minutes.</p>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</h2>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => <li key={l.label}><Link to={l.to} className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300">{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</div>
    </footer>
  );
}
