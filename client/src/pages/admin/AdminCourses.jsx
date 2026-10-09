import { useEffect, useState } from 'react';
import { coursesApi } from '../../api/courses';
import { departmentsApi } from '../../api/departments';
import CrudManager from '../../components/CrudManager';

const DEGREE_TYPES = ['UG', 'PG', 'Diploma', 'Certificate'];

export default function AdminCourses() {
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    departmentsApi.list({ limit: 100 }).then((d) => setDepartmentOptions(d.items.map((x) => ({ value: x._id, label: x.name }))));
  }, []);

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'code', header: 'Code', sortable: true },
    { key: 'department', header: 'Department', render: (r) => r.department?.name },
    { key: 'degreeType', header: 'Type' },
    { key: 'durationYears', header: 'Duration (yrs)' },
  ];

  const formFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'code', label: 'Code', required: true },
    { name: 'department', label: 'Department', type: 'select', required: true, options: departmentOptions },
    { name: 'degreeType', label: 'Degree Type', type: 'select', required: true, options: DEGREE_TYPES.map((d) => ({ value: d, label: d })) },
    { name: 'durationYears', label: 'Duration (years)', type: 'number', required: true },
    { name: 'totalSemesters', label: 'Total Semesters', type: 'number', required: true },
    { name: 'intake', label: 'Intake', type: 'number' },
    { name: 'eligibility', label: 'Eligibility' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const filterFields = [
    { key: 'search', type: 'text', placeholder: 'Search name or code' },
    { key: 'department', type: 'select', placeholder: 'All Departments', options: departmentOptions },
    { key: 'degreeType', type: 'select', placeholder: 'All Types', options: DEGREE_TYPES.map((d) => ({ value: d, label: d })) },
  ];

  return (
    <CrudManager
      title="Course"
      api={coursesApi}
      columns={columns}
      formFields={formFields}
      filterFields={filterFields}
    />
  );
}
