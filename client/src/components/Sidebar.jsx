import { NavLink } from 'react-router-dom';
import { NAV } from '../routes/navConfig';

export default function Sidebar({ role, open, onClose }) {
  const items = NAV[role] || [];

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-30 h-full w-64 shrink-0 overflow-y-auto bg-primary-800 text-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <span className="text-lg font-semibold text-gold-500">SKR</span>
          <span className="text-sm text-white/80">University</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role}`}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-white/70 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
