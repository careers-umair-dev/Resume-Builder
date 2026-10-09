import { ShieldAlert } from 'lucide-react';
import StatusScreen from '../components/common/StatusScreen';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export default function Unauthorized() {
  const { isAuthenticated } = useAuth();
  return (
    <StatusScreen icon={ShieldAlert} tone="red" title="Access denied" message="You don’t have permission to view this page.">
      <Button to={isAuthenticated ? '/dashboard' : '/login'}>{isAuthenticated ? 'Go to dashboard' : 'Log in'}</Button>
    </StatusScreen>
  );
}
