import { FileQuestion } from 'lucide-react';
import StatusScreen from '../components/common/StatusScreen';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <StatusScreen icon={FileQuestion} title="Page not found" message="The page you’re looking for doesn’t exist or has moved.">
      <Button to="/">Back to home</Button>
    </StatusScreen>
  );
}
