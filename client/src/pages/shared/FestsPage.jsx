import { festsApi } from '../../api/fests';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import CrudManager from '../../components/CrudManager';

export default function FestsPage() {
  const { user } = useAuth();

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'year', header: 'Year', sortable: true },
    { key: 'startDate', header: 'Start', sortable: true, render: (r) => formatDate(r.startDate) },
    { key: 'endDate', header: 'End', render: (r) => formatDate(r.endDate) },
    { key: 'venue', header: 'Venue' },
    { key: 'programs', header: 'Programs', render: (r) => r.programs?.length ?? 0 },
  ];

  const formFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'year', label: 'Year', type: 'number', required: true },
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'venue', label: 'Venue' },
    { name: 'registrationOpen', label: 'Registration Open', type: 'checkbox' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const filterFields = [{ key: 'search', type: 'text', placeholder: 'Search name or venue' }];

  return (
    <CrudManager
      title="Fest"
      api={festsApi}
      columns={columns}
      formFields={formFields}
      filterFields={filterFields}
      readOnly={user?.role !== 'admin'}
    />
  );
}
