import { useEffect, useState } from 'react';
import { settingsApi } from '../../api/settings';
import { usersApi } from '../../api/users';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import FormField, { inputClass } from '../../components/FormField';
import Table from '../../components/Table';
import FilterBar from '../../components/FilterBar';
import Badge from '../../components/Badge';
import Loader from '../../components/Loader';

export default function AdminSettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userFilters, setUserFilters] = useState({});

  useEffect(() => {
    settingsApi.get().then(setSettings);
  }, []);

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const data = await usersApi.list({ ...userFilters, limit: 50 });
      setUsers(data.items || []);
    } finally {
      setUsersLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userFilters)]);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const updated = await settingsApi.update(settings);
      setSettings(updated);
      showToast('Settings updated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user) {
    try {
      await usersApi.setStatus(user._id, !user.isActive);
      showToast(user.isActive ? 'Account deactivated' : 'Account activated');
      loadUsers();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  async function resetPassword(user) {
    try {
      await usersApi.resetPassword(user._id);
      showToast('Password reset to default');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => <span className="capitalize">{r.role}</span> },
    { key: 'isActive', header: 'Status', render: (r) => <Badge variant={r.isActive ? 'green' : 'red'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: '__actions',
      header: '',
      render: (r) => (
        <div className="flex gap-2 text-xs">
          <button type="button" onClick={() => toggleStatus(r)} className="text-primary-600 hover:underline">
            {r.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button type="button" onClick={() => resetPassword(r)} className="text-amber-600 hover:underline">
            Reset Password
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Settings</h1>

      {!settings ? (
        <Loader />
      ) : (
        <div className="grid gap-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5 sm:grid-cols-2">
          <FormField label="Attendance Threshold (%)">
            <input
              type="number"
              className={inputClass}
              value={settings.attendanceThreshold}
              onChange={(e) => setSettings({ ...settings, attendanceThreshold: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Attendance Warning (%)">
            <input
              type="number"
              className={inputClass}
              value={settings.attendanceWarning}
              onChange={(e) => setSettings({ ...settings, attendanceWarning: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Pass Percent (%)">
            <input
              type="number"
              className={inputClass}
              value={settings.passPercent}
              onChange={(e) => setSettings({ ...settings, passPercent: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Current Academic Year Label">
            <input
              className={inputClass}
              value={settings.currentAcademicYear}
              onChange={(e) => setSettings({ ...settings, currentAcademicYear: e.target.value })}
            />
          </FormField>
          <div className="sm:col-span-2">
            <button type="button" onClick={handleSaveSettings} disabled={saving} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">User Accounts</h2>
        <FilterBar
          fields={[
            { key: 'search', type: 'text', placeholder: 'Search name or email' },
            {
              key: 'role',
              type: 'select',
              placeholder: 'All Roles',
              options: [
                { value: 'admin', label: 'Admin' },
                { value: 'teacher', label: 'Teacher' },
                { value: 'student', label: 'Student' },
              ],
            },
          ]}
          values={userFilters}
          onChange={setUserFilters}
        />
        <Table columns={columns} rows={users} loading={usersLoading} emptyMessage="No users found" />
      </div>
    </div>
  );
}
