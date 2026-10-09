import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { APP_NAME } from '../../constants/app';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 font-semibold tracking-tight" aria-label={`${APP_NAME} home`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm"><FileText className="h-4.5 w-4.5" size={18} aria-hidden /></span>
      <span className={`text-lg ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{APP_NAME}</span>
    </Link>
  );
}
