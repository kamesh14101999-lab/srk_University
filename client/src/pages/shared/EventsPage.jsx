import { useState } from 'react';
import { eventsApi } from '../../api/events';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/formatters';
import CrudManager from '../../components/CrudManager';
import Badge from '../../components/Badge';

const TYPES = ['cultural', 'technical', 'workshop', 'seminar', 'conference', 'guest_lecture', 'student_activity', 'competition'];
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

export default function EventsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reloadKey, setReloadKey] = useState(0);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Type', render: (r) => <span className="capitalize">{r.type?.replace('_', ' ')}</span> },
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'venue', header: 'Venue' },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'upcoming' ? 'primary' : 'default'}>{r.status}</Badge> },
    {
      key: 'participants',
      header: 'Participants',
      render: (r) => r.participants?.length ?? 0,
    },
  ];

  if (user?.role === 'student') {
    columns.push({
      key: '__register',
      header: '',
      render: (r) => {
        const alreadyIn = r.participants?.some((p) => (p?._id || p) === user.profile?._id);
        if (!r.registrationRequired || r.status !== 'upcoming') return null;
        return (
          <button
            type="button"
            disabled={alreadyIn}
            onClick={async () => {
              try {
                await eventsApi.register(r._id);
                showToast('Registered for event');
                setReloadKey((k) => k + 1);
              } catch (err) {
                showToast(getErrorMessage(err), 'error');
              }
            }}
            className="rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            {alreadyIn ? 'Registered' : 'Register'}
          </button>
        );
      },
    });
  }

  const formFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: TYPES.map((t) => ({ value: t, label: t.replace('_', ' ') })) },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'startTime', label: 'Start Time (HH:mm)' },
    { name: 'endTime', label: 'End Time (HH:mm)' },
    { name: 'venue', label: 'Venue' },
    { name: 'organizer', label: 'Organizer' },
    { name: 'registrationRequired', label: 'Registration Required', type: 'checkbox' },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES.map((s) => ({ value: s, label: s })) },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  return (
    <CrudManager
      key={reloadKey}
      title="Event"
      api={eventsApi}
      columns={columns}
      formFields={formFields}
      readOnly={user?.role !== 'admin'}
    />
  );
}
