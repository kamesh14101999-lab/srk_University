import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Departments', path: '/departments' },
  { label: 'Courses', path: '/courses' },
  { label: 'Events', path: '/events' },
  { label: 'Fests', path: '/fests' },
  { label: 'Contact', path: '/contact' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-700">SKR</span>
            <span className="text-sm font-medium text-gray-600">University</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-primary-700' : 'text-gray-600 hover:text-primary-700'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Link
              to="/login"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Login
            </Link>
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-gray-600 lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-gray-100 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-2">
              {LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-md bg-primary-600 px-3 py-1.5 text-center text-sm font-semibold text-white"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-lg font-semibold text-gold-500">SKR University</p>
              <p className="mt-2 text-sm text-white/70">Visakhapatnam, Andhra Pradesh, India</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">Quick Links</p>
              <ul className="mt-2 space-y-1 text-sm text-white/70">
                {LINKS.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">Portal</p>
              <ul className="mt-2 space-y-1 text-sm text-white/70">
                <li>
                  <Link to="/login" className="hover:text-white">
                    Student / Teacher / Admin Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">Contact</p>
              <p className="mt-2 text-sm text-white/70">To be updated</p>
            </div>
          </div>
          <p className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-white/50">
            © {new Date().getFullYear()} SKR University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
