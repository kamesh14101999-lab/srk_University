import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api/notifications';
import { initials } from '../utils/formatters';
import ChangePasswordModal from './ChangePasswordModal';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    notificationsApi
      .list({ limit: 8 })
      .then((data) => {
        setNotifications(data.items || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }, []);

  async function handleMarkAllRead() {
    await notificationsApi.markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Open menu">
        ☰
      </button>

      <div className="flex-1" />

      <div className="relative" ref={notifRef}>
        <button
          type="button"
          onClick={() => setNotifOpen((o) => !o)}
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
              <span className="text-sm font-semibold">Notifications</span>
              <button type="button" onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:underline">
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-400">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className={`border-b border-gray-50 px-4 py-3 text-sm ${n.isRead ? '' : 'bg-primary-50/40'}`}>
                    <p className="font-medium text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={menuRef}>
        <button type="button" onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
            {initials(user?.name)}
          </span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/10">
            <div className="border-b border-gray-100 px-4 py-2">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs capitalize text-gray-500">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setChangePasswordOpen(true);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Change Password
            </button>
            <button type="button" onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
              Log out
            </button>
          </div>
        )}
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </header>
  );
}
