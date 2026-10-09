import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CommandPaletteProvider } from '../components/common/CommandPalette';
import { TOKEN_KEY } from '../constants/app';

export const USER = { _id: 'u1', name: 'Uyn Tester', email: 'uyn@example.com', profileImage: '' };

/** Renders `ui` inside all providers at `route`. Pass signedIn to start with a stored token. */
export function renderApp(ui, { route = '/', signedIn = false, extraRoutes = null } = {}) {
  if (signedIn) localStorage.setItem(TOKEN_KEY, 'test-token');
  return render(
    <ThemeProvider><ToastProvider><MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider>
      <CommandPaletteProvider><Routes>{extraRoutes}<Route path="*" element={ui} /></Routes></CommandPaletteProvider>
    </AuthProvider></MemoryRouter></ToastProvider></ThemeProvider>
  );
}
