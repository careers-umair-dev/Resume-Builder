/** Miniature, div-based sketch of each template layout (used on the landing page; reused by the template picker later). */
const Line = ({ w = '100%', h = 3, c = '#cbd5e1', className = '' }) => <div className={`rounded-full ${className}`} style={{ width: w, height: h, background: c }} />;

function Block({ color, title = true }) {
  return (
    <div className="space-y-1">
      {title && <Line w="38%" h={4} c={color} />}
      <Line /> <Line w="86%" /> <Line w="64%" />
    </div>
  );
}

export default function TemplateThumb({ variant, color = '#2563eb', className = '' }) {
  const body = (
    <>
      <Block color={color} /> <Block color={color} /> <Block color={color} />
    </>
  );
  let inner;
  if (variant === 'banner') {
    inner = (<><div className="p-3" style={{ background: color }}><Line w="55%" h={6} c="#fff" /><Line w="35%" h={3} c="#ffffffb0" className="mt-1.5" /></div><div className="space-y-3 p-3">{body}</div></>);
  } else if (variant === 'sidebar') {
    inner = (<div className="flex h-full"><div className="w-[32%] space-y-3 p-2.5" style={{ background: color }}><div className="mx-auto h-8 w-8 rounded-full bg-white/80" /><Line c="#ffffffb0" /><Line c="#ffffffb0" w="70%" /><Line c="#ffffff80" h={2} /><Line c="#ffffff80" h={2} w="80%" /><Line c="#ffffff80" h={2} w="60%" /></div><div className="flex-1 space-y-3 p-3"><Line w="60%" h={6} c="#334155" />{body}</div></div>);
  } else if (variant === 'split') {
    inner = (<div className="space-y-3 p-3"><div className="flex justify-between border-b-2 pb-2" style={{ borderColor: color }}><div className="w-1/2 space-y-1.5"><Line h={6} c="#334155" /><Line w="60%" c={color} /></div><div className="w-1/4 space-y-1"><Line h={2} /><Line h={2} /><Line h={2} /></div></div>{body}</div>);
  } else if (variant === 'classic') {
    inner = (<div className="space-y-3 p-3"><div className="space-y-1.5 border-b pb-2 text-center" style={{ borderColor: color }}><Line w="50%" h={6} c="#334155" className="mx-auto" /><Line w="70%" h={2} className="mx-auto" /></div>{[0, 1, 2].map((i) => (<div key={i} className="flex gap-2"><Line w="22%" h={3} c={color} /><div className="flex-1 space-y-1"><Line /><Line w="80%" /></div></div>))}</div>);
  } else if (variant === 'ats') {
    inner = (<div className="space-y-2 p-3"><Line w="45%" h={6} c="#111827" /><Line w="80%" h={2} /><div className="h-px bg-slate-400" />{[0, 1, 2, 3].map((i) => (<div key={i} className="space-y-1"><Line w="30%" h={3} c="#111827" /><Line /><Line w="90%" /></div>))}</div>);
  } else {
    inner = (<div className="space-y-3 p-4"><Line w="50%" h={7} c="#334155" /><Line w="30%" h={3} c={color} /><Line w="75%" h={2} />{body}</div>);
  }
  return <div className={`aspect-[1/1.414] w-full overflow-hidden rounded-md bg-white shadow-paper ring-1 ring-slate-200 ${className}`} aria-hidden>{inner}</div>;
}
