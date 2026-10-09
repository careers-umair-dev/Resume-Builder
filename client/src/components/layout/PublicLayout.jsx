import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import PageTransition from './PageTransition';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow-soft dark:focus:bg-slate-900">Skip to content</a>
      <Navbar />
      <main id="main" className="flex-1"><PageTransition><Outlet /></PageTransition></main>
      <Footer />
    </div>
  );
}
