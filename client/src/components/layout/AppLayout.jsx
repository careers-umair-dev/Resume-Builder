import { useCallback, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Bell, CheckCircle2, ChevronDown, Info, LogOut, Search, Settings, User } from 'lucide-react';
import Avatar from '../common/Avatar';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import PageTransition from './PageTransition';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useDismiss } from '../../hooks/useDismiss';
import { timeAgo } from '../../utils/date';
import { useCommandPalette } from '../common/CommandPalette';

const panel = 'absolute right-0 mt-2 origin-top-right rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900';
const anim = { initial: { opacity: 0, y: -6, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -6, scale: 0.97 }, transition: { duration: 0.12 } };
const ICONS = { success: [CheckCircle2, 'text-emerald-600'], error: [AlertCircle, 'text-red-600'], info: [Info, 'text-brand-600'] };

function Popover({ button, children, onOpen }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  return (
    <div className="relative" ref={ref}>
      {button({ open, toggle: () => setOpen((o) => { if (!o) onOpen?.(); return !o; }) })}
      <AnimatePresence>{open && children(close)}</AnimatePresence>
    </div>
  );
}

function NotificationsMenu() {
  const { history, unread, markAllRead, clear } = useNotifications();
  return (
    <Popover onOpen={undefined}
      button={({ open, toggle }) => (
        <button type="button" onClick={toggle} aria-haspopup="dialog" aria-expanded={open} aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">{unread > 9 ? '9+' : unread}</span>}
        </button>
      )}>
      {() => (
        <motion.div {...anim} role="dialog" aria-label="Notifications" className={`${panel} w-80 max-w-[calc(100vw-2rem)]`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {history.length > 0 && <div className="flex gap-3 text-xs font-medium text-brand-600 dark:text-brand-300"><button onClick={markAllRead} disabled={!unread} className="disabled:opacity-40">Mark read</button><button onClick={clear}>Clear</button></div>}
          </div>
          {history.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet. Saves, downloads and other activity will show up here.</p> : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {history.map((n) => { const [Icon, cls] = ICONS[n.type]; return (
                <li key={n.id} className={`flex gap-3 px-4 py-3 ${n.read ? '' : 'bg-brand-50/50 dark:bg-brand-900/10'}`}>
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} aria-hidden />
                  <div className="min-w-0"><p className="text-sm text-slate-700 dark:text-slate-200">{n.message}</p><p className="text-xs text-slate-400">{timeAgo(n.at)}</p></div>
                </li>); })}
            </ul>
          )}
        </motion.div>
      )}
    </Popover>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  return (
    <Popover button={({ open, toggle }) => (
      <button type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800">
        <Avatar user={user} size={32} />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">{user?.name}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
      </button>
    )}>
      {(close) => (
        <motion.div {...anim} role="menu" className={`${panel} w-60 p-1.5`}>
          <div className="border-b border-slate-100 px-3 pb-2.5 pt-2 dark:border-slate-800"><p className="truncate text-sm font-medium">{user?.name}</p><p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p></div>
          {[['/profile', User, 'Profile'], ['/settings', Settings, 'Settings']].map(([to, Icon, label]) => (
            <Link key={to} to={to} role="menuitem" onClick={close} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"><Icon className="h-4 w-4" aria-hidden />{label}</Link>
          ))}
          <button role="menuitem" onClick={logout} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"><LogOut className="h-4 w-4" aria-hidden />Log out</button>
        </motion.div>
      )}
    </Popover>
  );
}

export default function AppLayout() {
  const { openPalette } = useCommandPalette();
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow-soft dark:focus:bg-slate-900">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo to="/dashboard" />
          <div className="flex items-center gap-1">
            <button type="button" onClick={openPalette} aria-label="Open command palette" title="Search commands (Ctrl+K)" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <Search className="h-5 w-5" aria-hidden />
            </button>
            <ThemeToggle /><NotificationsMenu /><UserMenu />
          </div>
        </div>
      </header>
      <main id="main" className="container-page py-8"><PageTransition><Outlet /></PageTransition></main>
    </div>
  );
}
