import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PageLoader from '../common/PageLoader';
import StatusScreen from '../common/StatusScreen';
import Button from '../common/Button';

export function ProtectedRoute() {
  const { status, retry } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <PageLoader label="Restoring your session…" />;
  if (status === 'error') {
    return (
      <StatusScreen icon={WifiOff} tone="amber" title="Can't reach the server" message="We couldn't verify your session. Check your connection and try again.">
        <Button onClick={retry}>Try again</Button>
      </StatusScreen>
    );
  }
  if (status !== 'authed') return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

/** Login / register: send signed-in users to the dashboard. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <PageLoader />;
  if (status === 'authed') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
