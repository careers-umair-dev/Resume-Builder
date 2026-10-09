import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, X } from 'lucide-react';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useCommandPalette } from '../common/CommandPalette';

const LINKS = [
  { label: 'Features', hash: '#features' },
  { label: 'Templates', hash: '#templates' },
  { label: 'How it works', hash: '#how-it-works' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { openPalette } = useCommandPalette();
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.hash} to={{ pathname: '/', hash: l.hash }} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">{l.label}</Link>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={openPalette} aria-label="Open command palette" title="Search commands (Ctrl+K)"
            className="inline-flex h-9 items-center gap-2 rounded-lg px-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <Search className="h-4 w-4" aria-hidden />
            <kbd className="hidden rounded border border-slate-300 px-1.5 py-0.5 text-[10px] lg:inline dark:border-slate-700">Ctrl K</kbd>
          </button>
          <ThemeToggle />
          {isAuthenticated ? <Button to="/dashboard" size="sm">Dashboard</Button> : (<><Button to="/login" variant="ghost" size="sm">Log in</Button><Button to="/register" size="sm">Get started</Button></>)}
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <button type="button" onClick={openPalette} aria-label="Open command palette" title="Search commands (Ctrl+K)"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            <Search className="h-5 w-5" aria-hidden />
          </button>
          <ThemeToggle />
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950">
            <div className="container-page flex flex-col gap-1 py-3">
              {LINKS.map((l) => <Link key={l.hash} to={{ pathname: '/', hash: l.hash }} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">{l.label}</Link>)}
              <div className="mt-2 flex gap-2">
                {isAuthenticated ? <Button to="/dashboard" className="flex-1">Dashboard</Button> : (<><Button to="/login" variant="secondary" className="flex-1">Log in</Button><Button to="/register" className="flex-1">Get started</Button></>)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
