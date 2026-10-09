import { departmentsApi } from '../../api/departments';
import CrudManager from '../../components/CrudManager';

export default function AdminDepartments() {
  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'code', header: 'Code', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
  ];

  const formFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'code', label: 'Code', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'email', label: 'Email' },
    { name: 'phone', label: 'Phone' },
  ];

  const filterFields = [{ key: 'search', type: 'text', placeholder: 'Search name or code' }];

  return (
    <CrudManager
      title="Department"
      api={departmentsApi}
      columns={columns}
      formFields={formFields}
      filterFields={filterFields}
    />
  );
}
