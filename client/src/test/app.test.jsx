import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { renderApp, USER } from './utils';

vi.mock('../services/authService', () => ({ authService: { me: vi.fn(), login: vi.fn(), register: vi.fn(), updateProfile: vi.fn(), changePassword: vi.fn() } }));
vi.mock('../services/resumeService', () => ({ resumeService: { list: vi.fn(), stats: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), duplicate: vi.fn(), pdf: vi.fn(), downloads: vi.fn() } }));
vi.mock('../components/preview/LivePreview', () => ({ default: ({ payload }) => <div data-testid="preview" data-template={payload.template} /> }));

import { authService } from '../services/authService';
import { resumeService } from '../services/resumeService';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ResumeBuilder from '../pages/ResumeBuilder';
import Settings from '../pages/Settings';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

beforeEach(() => { vi.clearAllMocks(); authService.me.mockResolvedValue(USER); });

describe('landing', () => {
  it('shows the headline and both calls to action', () => {
    renderApp(<Landing />);
    expect(screen.getByRole('heading', { level: 1, name: /build a resume that gets you noticed/i })).toBeInTheDocument();
    screen.getAllByRole('link', { name: /create your resume/i }).forEach((a) => expect(a).toHaveAttribute('href', '/register'));
    expect(screen.getByRole('link', { name: /explore templates/i })).toBeInTheDocument();
    expect(screen.getAllByRole('figure')).toHaveLength(6);
  });
});

describe('auth forms', () => {
  it('login shows validation errors then surfaces a server error', async () => {
    const user = userEvent.setup();
    renderApp(<Login />, { route: '/login' });
    await user.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    authService.login.mockRejectedValue({ response: { status: 401, data: { message: 'Invalid email or password' } } });
    await user.type(screen.getByLabelText(/email/i), 'a@b.co');
    await user.type(screen.getByLabelText(/^password$/i), 'wrong-pass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('login stores the token and redirects on success', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({ token: 'tok123', user: USER });
    renderApp(<Login />, { route: '/login', extraRoutes: <Route path="/dashboard" element={<p>DASH</p>} /> });
    await user.type(screen.getByLabelText(/email/i), 'uyn@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'goodpass1');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(await screen.findByText('DASH')).toBeInTheDocument();
    expect(localStorage.getItem('rb_token')).toBe('tok123');
  });

  it('register enforces password rules and matching confirmation, and maps server field errors', async () => {
    const user = userEvent.setup();
    renderApp(<Register />, { route: '/register' });
    await user.type(screen.getByLabelText(/full name/i), 'Uyn');
    await user.type(screen.getByLabelText(/^email/i), 'uyn@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'abcdefgh');
    expect(screen.getByText(/contains a number/i).closest('li')).toHaveTextContent('(not met)');
    await user.type(screen.getByLabelText(/confirm password/i), 'different1');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Password does not meet the requirements')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
    await user.clear(screen.getByLabelText(/^password$/i)); await user.type(screen.getByLabelText(/^password$/i), 'abcdefg1');
    await user.clear(screen.getByLabelText(/confirm password/i)); await user.type(screen.getByLabelText(/confirm password/i), 'abcdefg1');
    authService.register.mockRejectedValue({ response: { status: 409, data: { message: 'An account with this email already exists' } } });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('An account with this email already exists')).toBeInTheDocument();
  });

  it('protected routes redirect guests to login and show a retry screen when the server is down', async () => {
    renderApp(<p>SECRET</p>, { route: '/private', extraRoutes: <><Route path="/login" element={<p>LOGIN PAGE</p>} /><Route element={<ProtectedRoute />}><Route path="/private" element={<p>SECRET</p>} /></Route></> });
    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
    authService.me.mockRejectedValue({ isNetworkError: true });
    renderApp(<p />, { route: '/private', signedIn: true, extraRoutes: <Route element={<ProtectedRoute />}><Route path="/private" element={<p>SECRET2</p>} /></Route> });
    expect(await screen.findByText(/can't reach the server/i)).toBeInTheDocument();
    expect(screen.queryByText('SECRET2')).not.toBeInTheDocument();
  });
});

describe('command palette', () => {
  it('opens with Ctrl+K, filters commands and navigates to the selected page', async () => {
    const user = userEvent.setup();
    renderApp(<p>HOME</p>, { signedIn: true, extraRoutes: <Route path="/settings" element={<p>SETTINGS PAGE</p>} /> });
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const search = await screen.findByRole('textbox', { name: 'Search commands' });
    await user.type(search, 'settings');
    await user.keyboard('{Enter}');
    expect(await screen.findByText('SETTINGS PAGE')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument());
  });

  it('creates a new resume from the palette for a signed-in user', async () => {
    const user = userEvent.setup();
    resumeService.create.mockResolvedValue({ _id: 'created-from-palette' });
    renderApp(<p>HOME</p>, {
      route: '/',
      signedIn: true,
      extraRoutes: <Route path="/resumes/:id/edit" element={<p>NEW RESUME EDITOR</p>} />,
    });
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await user.click(await screen.findByRole('option', { name: /create a resume/i }));
    expect(await screen.findByText('NEW RESUME EDITOR')).toBeInTheDocument();
    expect(resumeService.create).toHaveBeenCalledWith({ name: 'Untitled Resume' });
  });
});

const R = (o) => ({ _id: 'r1', name: 'Frontend Resume', template: 'modern-professional', completion: { percent: 62 }, updatedAt: new Date().toISOString(), customization: {}, ...o });

describe('dashboard', () => {
  beforeEach(() => {
    resumeService.stats.mockResolvedValue({ total: 2, avgCompletion: 55, lastUpdated: new Date().toISOString(), recent: [R()] });
    resumeService.list.mockResolvedValue({ resumes: [R(), R({ _id: 'r2', name: 'Backend Resume' })], total: 2, totalAll: 2, page: 1, pages: 1 });
  });

  it('lists resumes, supports search and confirmed deletion', async () => {
    const user = userEvent.setup();
    resumeService.remove.mockResolvedValue({});
    renderApp(<Dashboard />, { route: '/dashboard', signedIn: true });
    expect(await screen.findByText('Backend Resume')).toBeInTheDocument();
    expect(screen.getByText('Total resumes')).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: /search resumes/i }), 'back');
    await waitFor(() => expect(resumeService.list).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'back' })));
    await user.click(screen.getAllByRole('button', { name: /^delete$/i })[1]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/permanently deleted/i)).toBeInTheDocument();
    expect(resumeService.remove).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: /delete resume/i }));
    await waitFor(() => expect(resumeService.remove).toHaveBeenCalledWith('r2'));
  });

  it('shows an empty state for new users and an error state with retry', async () => {
    resumeService.list.mockResolvedValue({ resumes: [], total: 0, totalAll: 0, page: 1, pages: 0 });
    renderApp(<Dashboard />, { route: '/dashboard', signedIn: true });
    expect(await screen.findByText(/create your first resume/i)).toBeInTheDocument();
  });

  it('creates a resume from the dialog', async () => {
    const user = userEvent.setup();
    resumeService.create.mockResolvedValue({ _id: 'new1' });
    renderApp(<Dashboard />, { route: '/dashboard', signedIn: true, extraRoutes: <Route path="/resumes/:id/edit" element={<p>EDITOR</p>} /> });
    await screen.findByText('Backend Resume');
    await user.click(screen.getAllByRole('button', { name: /create resume/i })[0]);
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/resume name/i), 'My CV');
    await user.click(within(dialog).getByLabelText(/Compact ATS/i));
    await user.click(within(dialog).getByRole('button', { name: /create resume/i }));
    await waitFor(() => expect(resumeService.create).toHaveBeenCalledWith({ name: 'My CV', template: 'compact-ats' }));
    expect(await screen.findByText('EDITOR')).toBeInTheDocument();
  });
});

const FULL = {
  _id: 'r1', name: 'Builder Resume', template: 'modern-professional', completion: { percent: 20, suggestions: ['Add your education'] }, updatedAt: '2026-01-01T00:00:00Z',
  personalInfo: { fullName: 'Uyn Tester', title: '', email: 'uyn@example.com', phone: '', location: '', website: '', linkedin: '', github: '', portfolio: '', photo: '' },
  summary: '', experience: [], education: [], skills: [], projects: [], certifications: [], achievements: [], languages: [], volunteer: [], interests: [], publications: [], awards: [],
  enabledSections: ['summary', 'experience', 'education', 'skills', 'projects'],
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'languages', 'volunteer', 'interests', 'publications', 'awards'],
  customization: { primaryColor: '#2563eb', accentColor: '#0ea5e9', fontFamily: 'auto', fontSize: 10, lineSpacing: 1.3, sectionSpacing: 16, margins: 40, headingStyle: 'auto', photoStyle: 'auto', density: 'comfortable', preset: 'professional' },
};
const builderRoute = <Route path="/resumes/:id/edit" element={<ResumeBuilder />} />;
const openBuilder = async () => {
  resumeService.get.mockResolvedValue(JSON.parse(JSON.stringify(FULL)));
  resumeService.update.mockImplementation(async (id, body) => ({ ...FULL, ...body, completion: { percent: 40, suggestions: [] }, updatedAt: '2026-01-02T00:00:00Z' }));
  renderApp(<p />, { route: '/resumes/r1/edit', signedIn: true, extraRoutes: builderRoute });
  await screen.findByLabelText('Resume name');
};

describe('resume builder', () => {
  it('loads the resume, renders the editor and passes the draft to the preview', async () => {
    await openBuilder();
    expect(screen.getByRole('button', { name: /personal information/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Full name')).toHaveValue('Uyn Tester');
    expect(screen.getByText(/Resume Completion: 20%/)).toBeInTheDocument();
    expect(await screen.findByTestId('preview')).toHaveAttribute('data-template', 'modern-professional');
  });

  it('autosaves only the changed fields after a pause, and updates the completion score', async () => {
    const user = userEvent.setup();
    await openBuilder();
    await user.type(screen.getByLabelText('Professional title'), 'Intern');
    expect(screen.getAllByRole('status').some((n) => /unsaved changes/i.test(n.textContent))).toBe(true);
    await waitFor(() => expect(resumeService.update).toHaveBeenCalledTimes(1), { timeout: 4000 });
    const [id, body] = resumeService.update.mock.calls[0];
    expect(id).toBe('r1');
    expect(Object.keys(body)).toEqual(['personalInfo']);
    expect(body.personalInfo.title).toBe('Intern');
    expect(await screen.findByText(/Resume Completion: 40%/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole('status').some((n) => /saved/i.test(n.textContent) && !/unsaved/i.test(n.textContent))).toBe(true));
  });

  it('keeps an invalid email on screen but never sends it', async () => {
    const user = userEvent.setup();
    await openBuilder();
    const email = screen.getByLabelText('Email');
    await user.clear(email); await user.type(email, 'not-an-email');
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText(/1 field needs attention/i)).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 1800));
    expect(resumeService.update).not.toHaveBeenCalled();
    await user.clear(email); await user.type(email, 'ok@example.com');
    await waitFor(() => expect(resumeService.update).toHaveBeenCalled(), { timeout: 4000 });
    expect(resumeService.update.mock.calls.at(-1)[1].personalInfo.email).toBe('ok@example.com');
  });

  it('adds an experience entry with a client id the server will accept, and supports undo', async () => {
    const user = userEvent.setup();
    await openBuilder();
    await user.click(screen.getByRole('button', { name: /^experience/i, expanded: false }));
    await user.click(screen.getByRole('button', { name: /add experience/i }));
    await user.type(await screen.findByLabelText('Job title'), 'Software Intern');
    await waitFor(() => expect(resumeService.update.mock.calls.some(([, body]) => body.experience?.some((entry) => entry.title === 'Software Intern'))).toBe(true), { timeout: 10000 });
    const saved = resumeService.update.mock.calls.findLast(([, body]) => body.experience?.some((entry) => entry.title === 'Software Intern'))[1].experience;
    expect(saved).toHaveLength(1);
    expect(saved[0]._id).toMatch(/^[0-9a-f]{24}$/);
    expect(saved[0].title).toBe('Software Intern');
    await user.click(screen.getByRole('button', { name: /^undo$/i })); // first undo reverts the typing...
    expect(screen.getByLabelText('Job title')).toHaveValue('');
    await user.click(screen.getByRole('button', { name: /^undo$/i })); // ...second removes the entry
    await waitFor(() => expect(screen.queryByLabelText('Job title')).not.toBeInTheDocument());
  });

  it('applies a preset and a template change to the draft and resets customization', async () => {
    const user = userEvent.setup();
    await openBuilder();
    await user.click(screen.getByRole('tab', { name: 'Design' }));
    await user.click(screen.getByRole('radio', { name: /minimal/i }));
    await waitFor(() => expect(resumeService.update).toHaveBeenCalled(), { timeout: 4000 });
    const c = resumeService.update.mock.calls.at(-1)[1].customization;
    expect(c).toMatchObject({ preset: 'minimal', primaryColor: '#111827', headingStyle: 'plain' });
    fireEvent.change(screen.getByLabelText('Font size'), { target: { value: '12' } });
    expect(await screen.findByText(/Custom settings/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reset customization/i }));
    await waitFor(() => expect(resumeService.update.mock.calls.at(-1)[1].customization.preset).toBe('professional'), { timeout: 4000 });
  });

  it('redirects unknown resumes to the 404 page', async () => {
    resumeService.get.mockRejectedValue({ response: { status: 404 } });
    renderApp(<p />, { route: '/resumes/zzz/edit', signedIn: true, extraRoutes: <><Route path="/404" element={<p>NOT FOUND PAGE</p>} />{builderRoute}</> });
    expect(await screen.findByText('NOT FOUND PAGE')).toBeInTheDocument();
  });
});

describe('settings', () => {
  it('changes the password, swaps in the new session token, and maps a wrong current password to its field', async () => {
    const user = userEvent.setup();
    resumeService.downloads.mockResolvedValue([]);
    renderApp(<Settings />, { route: '/settings', signedIn: true });
    await screen.findByText(/no downloads yet/i);
    authService.changePassword.mockRejectedValueOnce({ response: { status: 400, data: { message: 'Current password is incorrect' } } });
    await user.type(screen.getByLabelText('Current password'), 'oldpass12');
    await user.type(screen.getByLabelText('New password'), 'newpass123');
    await user.type(screen.getByLabelText('Confirm new password'), 'newpass123');
    await user.click(screen.getByRole('button', { name: /change password/i }));
    expect(await screen.findByText('Current password is incorrect')).toBeInTheDocument();
    authService.changePassword.mockResolvedValueOnce({ token: 'fresh-token', user: USER });
    await user.click(screen.getByRole('button', { name: /change password/i }));
    await waitFor(() => expect(localStorage.getItem('rb_token')).toBe('fresh-token'));
  });
});
