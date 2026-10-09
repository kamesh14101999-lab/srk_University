import { calendarApi } from '../../api/calendar';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import CrudManager from '../../components/CrudManager';

const TYPES = ['semester_start', 'semester_end', 'holiday', 'internal_exam', 'semester_exam', 'results', 'event', 'workshop', 'fest', 'other'];

export default function CalendarPage() {
  const { user } = useAuth();

  const columns = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'type', header: 'Type', render: (r) => <span className="capitalize">{r.type.replace('_', ' ')}</span> },
    { key: 'startDate', header: 'Start', sortable: true, render: (r) => formatDate(r.startDate) },
    { key: 'endDate', header: 'End', sortable: true, render: (r) => formatDate(r.endDate) },
  ];

  const formFields = [
    { name: 'title', label: 'Title', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: TYPES.map((t) => ({ value: t, label: t.replace('_', ' ') })) },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const filterFields = [
    { key: 'search', type: 'text', placeholder: 'Search title' },
    { key: 'type', type: 'select', placeholder: 'All Types', options: TYPES.map((t) => ({ value: t, label: t.replace('_', ' ') })) },
  ];

  return (
    <CrudManager
      title="Calendar Entry"
      api={calendarApi}
      columns={columns}
      formFields={formFields}
      filterFields={filterFields}
      readOnly={user?.role !== 'admin'}
    />
  );
}
