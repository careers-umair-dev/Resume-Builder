const STEPS = [
  { title: 'Choose a template', text: 'Browse the layouts and pick the one that fits your story.' },
  { title: 'Add your information', text: 'Fill in experience, education, projects and skills once.' },
  { title: 'Customize your resume', text: 'Adjust colors, fonts and spacing with a live preview.' },
  { title: 'Download PDF', text: 'Export a polished A4 PDF, ready to send.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="container-page">
        <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
