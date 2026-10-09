import { Link, Navigate, useParams } from 'react-router-dom';
import { INFO_PAGES } from '../constants/infoPages';
import { CONTACT_EMAIL } from '../constants/app';

export default function Info({ page }) {
  const params = useParams();
  const data = INFO_PAGES[page || params.page];
  if (!data) return <Navigate to="/404" replace />;
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
      <div className="mt-6 space-y-4 text-slate-700 dark:text-slate-300">
        {data.body.map((p) => <p key={p}>{p}</p>)}
        {data.contact && (CONTACT_EMAIL
          ? <p><a className="font-medium text-brand-600 hover:underline dark:text-brand-300" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          : <p className="text-sm text-slate-500">Contact details have not been configured for this deployment.</p>)}
      </div>
      <Link to="/" className="mt-10 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">← Back to home</Link>
    </div>
  );
}
