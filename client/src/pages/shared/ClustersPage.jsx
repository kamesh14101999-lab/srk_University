import { clustersApi } from '../../api/clusters';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import CrudManager from '../../components/CrudManager';

export default function ClustersPage() {
  const { user } = useAuth();

  const columns = [
    { key: 'clusterName', header: 'Cluster', sortable: true },
    { key: 'activityName', header: 'Activity', sortable: true },
    { key: 'activityType', header: 'Type' },
    { key: 'date', header: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'venue', header: 'Venue' },
    { key: 'participants', header: 'Participants', render: (r) => r.participants?.length ?? 0 },
  ];

  const formFields = [
    { name: 'clusterName', label: 'Cluster Name', required: true },
    { name: 'activityName', label: 'Activity Name', required: true },
    { name: 'activityType', label: 'Activity Type' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'venue', label: 'Venue' },
    { name: 'organizer', label: 'Organizer' },
    { name: 'results', label: 'Results', type: 'textarea' },
  ];

  const filterFields = [{ key: 'search', type: 'text', placeholder: 'Search cluster or activity name' }];

  return (
    <CrudManager
      title="Cluster Activity"
      api={clustersApi}
      columns={columns}
      formFields={formFields}
      filterFields={filterFields}
      readOnly={user?.role !== 'admin'}
    />
  );
}
