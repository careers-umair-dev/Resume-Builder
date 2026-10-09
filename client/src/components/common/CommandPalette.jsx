import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FilePlus2, Home, Info, LogIn, Moon, Search, Settings, Sun, UserRound } from 'lucide-react';
import Modal from './Modal';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { resumeService } from '../../services/resumeService';
import { getErrorMessage } from '../../utils/errors';

const CommandPaletteContext = createContext(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  return context;
}

export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();
  const toast = useToast();

  const openPalette = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  }, []);
  const closePalette = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPalette();
      }
    };
    const onOpen = () => openPalette();
    window.addEventListener('keydown', onShortcut);
    window.addEventListener('command-palette:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onShortcut);
      window.removeEventListener('command-palette:open', onOpen);
    };
  }, [openPalette]);

  const commands = useMemo(() => {
    const items = [
      { label: 'Go to home', description: 'Open the landing page', keywords: 'home landing', icon: Home, run: () => navigate('/') },
      { label: 'Browse features', description: 'Explore what Resumify can do', keywords: 'features templates how it works', icon: Search, run: () => navigate({ pathname: '/', hash: '#features' }) },
      { label: 'About Resumify', description: 'Learn about this resume builder', keywords: 'about', icon: Info, run: () => navigate('/about') },
      { label: 'Contact', description: 'Open contact information', keywords: 'contact support', icon: Info, run: () => navigate('/contact') },
      { label: isDark ? 'Switch to light theme' : 'Switch to dark theme', description: 'Change the appearance', keywords: 'theme appearance dark light', icon: isDark ? Sun : Moon, run: toggle },
    ];
    if (user) {
      items.push(
        { label: 'Open dashboard', description: 'View and manage your resumes', keywords: 'dashboard resumes', icon: Home, run: () => navigate('/dashboard') },
        { label: 'Create a resume', description: 'Start a new resume with the default template', keywords: 'new resume create add', icon: FilePlus2, run: async () => {
          const resume = await resumeService.create({ name: 'Untitled Resume' });
          navigate(`/resumes/${resume._id}/edit`);
        } },
        { label: 'Open profile', description: 'Edit your profile details', keywords: 'profile account user', icon: UserRound, run: () => navigate('/profile') },
        { label: 'Open settings', description: 'Manage your account settings', keywords: 'settings password downloads', icon: Settings, run: () => navigate('/settings') }
      );
    } else {
      items.push({ label: 'Log in', description: 'Sign in to your account', keywords: 'login sign in', icon: LogIn, run: () => navigate('/login') });
    }
    return items;
  }, [isDark, navigate, toggle, user]);

  const normalized = query.trim().toLowerCase();
  const filtered = commands.filter((command) =>
    `${command.label} ${command.description} ${command.keywords}`.toLowerCase().includes(normalized)
  );

  useEffect(() => setActiveIndex(0), [query]);

  const runCommand = async (command) => {
    if (busy) return;
    setBusy(true);
    try {
      await command.run();
      closePalette();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const onSearchKeyDown = (event) => {
    if (!filtered.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % filtered.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + filtered.length) % filtered.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runCommand(filtered[activeIndex]);
    }
  };

  return (
    <CommandPaletteContext.Provider value={{ openPalette }}>
      {children}
      <Modal open={open} onClose={closePalette} title="Command palette" description="Search pages and actions. Use the arrow keys and Enter to select." size="md">
        <label className="sr-only" htmlFor="command-search">Search commands</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden />
          <input
            id="command-search"
            data-autofocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search commands..."
            autoComplete="off"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div className="mt-3 max-h-[50vh] overflow-y-auto" role="listbox" aria-label="Commands">
          {filtered.length ? filtered.map((command, index) => {
            const Icon = command.icon;
            return (
              <button
                key={command.label}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                disabled={busy}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => runCommand(command)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left disabled:opacity-50 ${activeIndex === index ? 'bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'}`}
              >
                <Icon className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{command.label}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{command.description}</span>
                </span>
                {activeIndex === index && <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />}
              </button>
            );
          }) : <p className="px-3 py-6 text-center text-sm text-slate-500">No matching commands.</p>}
        </div>
        <p className="mt-3 text-xs text-slate-400"><kbd className="rounded border px-1 py-0.5">Ctrl</kbd> + <kbd className="rounded border px-1 py-0.5">K</kbd> to open · Esc to close</p>
      </Modal>
    </CommandPaletteContext.Provider>
  );
}
