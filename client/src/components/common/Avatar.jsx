import { assetUrl } from '../../utils/assets';

export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

export default function Avatar({ user, size = 32, className = '' }) {
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (user?.profileImage) return <img src={assetUrl(user.profileImage)} alt="" style={style} className={`shrink-0 rounded-full object-cover ${className}`} />;
  return <span style={style} className={`flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white ${className}`} aria-hidden>{initials(user?.name)}</span>;
}
