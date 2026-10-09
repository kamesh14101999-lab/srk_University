import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV } from '../routes/navConfig';

function linkClass({ isActive }) {
  return `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-600 text-white' : 'text-white/70 hover:bg-primary-700 hover:text-white'
  }`;
}

export default function Sidebar({ role, open, onClose }) {
  const entries = NAV[role] || [];
  const location = useLocation();

  const initialOpenSections = useMemo(() => {
    const active = new Set();
    for (const entry of entries) {
      if (entry.section && entry.items.some((item) => location.pathname.startsWith(item.path))) {
        active.add(entry.section);
      }
    }
    return active;
    // Only computed once on mount, per role — collapsing/expanding afterwards is left to the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const [openSections, setOpenSections] = useState(initialOpenSections);

  function toggleSection(section) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

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
          {entries.map((entry) => {
            if (!entry.section) {
              return (
                <NavLink
                  key={entry.path}
                  to={entry.path}
                  end={entry.path === `/${role}`}
                  onClick={onClose}
                  className={linkClass}
                >
                  {entry.label}
                </NavLink>
              );
            }

            const isOpen = openSections.has(entry.section);
            return (
              <div key={entry.section} className="mt-1 first:mt-0">
                <button
                  type="button"
                  onClick={() => toggleSection(entry.section)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/50 hover:text-white/80"
                >
                  {entry.section}
                  <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>›</span>
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-0.5 pl-2">
                    {entry.items.map((item) => (
                      <NavLink key={item.path} to={item.path} onClick={onClose} className={linkClass}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
