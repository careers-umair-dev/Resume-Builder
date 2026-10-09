import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

export default function FinalCta() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight">Your next opportunity starts with a great resume.</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">Create your first resume in minutes and export it as a PDF whenever you’re ready.</p>
          <Button to={isAuthenticated ? '/dashboard' : '/register'} size="lg" className="mt-8 !bg-white !text-brand-700 hover:!bg-brand-50">Create Your Resume</Button>
        </div>
      </div>
    </section>
  );
}
