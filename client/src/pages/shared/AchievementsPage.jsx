import { achievementsApi } from '../../api/achievements';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import CrudManager from '../../components/CrudManager';

const CATEGORIES = ['academic', 'sports', 'cultural', 'technical', 'club', 'other'];

export default function AchievementsPage() {
  const { user } = useAuth();

  const columns = [
    { key: 'student', header: 'Student', render: (r) => r.student?.user?.name || '-' },
    { key: 'title', header: 'Title' },
    { key: 'category', header: 'Category', render: (r) => <span className="capitalize">{r.category}</span> },
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
  ];

  const formFields = [
    { name: 'student', label: 'Student ObjectId', required: true },
    { name: 'title', label: 'Title', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
    { name: 'date', label: 'Date', type: 'date' },
  ];

  return <CrudManager title="Achievement" api={achievementsApi} columns={columns} formFields={formFields} readOnly={user?.role !== 'admin'} />;
}
