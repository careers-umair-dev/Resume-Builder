import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ScrollManager from './components/layout/ScrollManager';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute';
import PageLoader from './components/common/PageLoader';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Info = lazy(() => import('./pages/Info'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

export default function App() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Landing />} />
            {['about', 'privacy', 'terms', 'contact'].map((p) => <Route key={p} path={p} element={<Info page={p} />} />)}
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route path="404" element={<NotFound />} />
          </Route>
          <Route element={<PublicOnlyRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="resumes/:id/edit" element={<ResumeBuilder />} />
          </Route>
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
