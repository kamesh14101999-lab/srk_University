import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teachersApi } from '../../api/teachers';
import { departmentsApi } from '../../api/departments';
import CrudManager from '../../components/CrudManager';
import Badge from '../../components/Badge';

const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Instructor'];
const STATUSES = ['active', 'on_leave', 'inactive'];

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    departmentsApi.list({ limit: 100 }).then((d) => setDepartmentOptions(d.items.map((x) => ({ value: x._id, label: x.name }))));
  }, []);

  const columns = [
    { key: 'employeeId', header: 'Employee ID' },
    { key: 'name', header: 'Name', render: (r) => r.user?.name },
    { key: 'department', header: 'Department', render: (r) => r.department?.name },
    { key: 'designation', header: 'Designation' },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'active' ? 'green' : 'default'}>{r.status}</Badge> },
  ];

  const formFields = [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email', required: true },
    { name: 'employeeId', label: 'Employee ID', required: true },
    { name: 'phone', label: 'Phone' },
    { name: 'department', label: 'Department', type: 'select', required: true, options: departmentOptions },
    { name: 'designation', label: 'Designation', type: 'select', required: true, options: DESIGNATIONS.map((d) => ({ value: d, label: d })) },
    { name: 'qualification', label: 'Qualification' },
    { name: 'specialization', label: 'Specialization' },
    { name: 'experienceYears', label: 'Experience (years)', type: 'number' },
    { name: 'joiningDate', label: 'Joining Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES.map((s) => ({ value: s, label: s })) },
  ];

  const filterFields = [
    { key: 'search', type: 'text', placeholder: 'Search name or employee ID' },
    { key: 'department', type: 'select', placeholder: 'All Departments', options: departmentOptions },
    { key: 'status', type: 'select', placeholder: 'All Statuses', options: STATUSES.map((s) => ({ value: s, label: s })) },
  ];

  return (
    <CrudManager
      title="Teacher"
      api={teachersApi}
      columns={columns}
      formFields={formFields}
      filterFields={filterFields}
      onRowClick={(row) => navigate(`/admin/teachers/${row._id}`)}
    />
  );
}
