import { academicYearsApi } from '../../api/academicYears';
import CrudManager from '../../components/CrudManager';
import Badge from '../../components/Badge';

export default function AdminAcademicYears() {
  const columns = [
    { key: 'label', header: 'Label' },
    { key: 'startDate', header: 'Start', render: (r) => (r.startDate ? new Date(r.startDate).toLocaleDateString() : '-') },
    { key: 'endDate', header: 'End', render: (r) => (r.endDate ? new Date(r.endDate).toLocaleDateString() : '-') },
    { key: 'isCurrent', header: 'Current', render: (r) => (r.isCurrent ? <Badge variant="green">Current</Badge> : null) },
  ];

  const formFields = [
    { name: 'label', label: 'Label (e.g. 2026-27)', required: true },
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'isCurrent', label: 'Set as current academic year', type: 'checkbox' },
  ];

  return <CrudManager title="Academic Year" api={academicYearsApi} columns={columns} formFields={formFields} />;
}
