import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsApi } from '../../api/students';
import { departmentsApi } from '../../api/departments';
import { coursesApi } from '../../api/courses';
import CrudManager from '../../components/CrudManager';
import Badge from '../../components/Badge';

const GENDERS = ['male', 'female', 'other'];
const STATUSES = ['active', 'detained', 'graduated', 'dropped'];

export default function AdminStudents() {
  const navigate = useNavigate();
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  useEffect(() => {
    departmentsApi.list({ limit: 100 }).then((d) => setDepartmentOptions(d.items.map((x) => ({ value: x._id, label: x.name }))));
    coursesApi.list({ limit: 100 }).then((d) => setCourseOptions(d.items.map((x) => ({ value: x._id, label: x.name }))));
  }, []);

  const columns = [
    { key: 'studentId', header: 'Student ID', sortable: true },
    { key: 'name', header: 'Name', render: (r) => r.user?.name },
    { key: 'department', header: 'Department', render: (r) => r.department?.name },
    { key: 'course', header: 'Course', render: (r) => r.course?.name },
    { key: 'semester', header: 'Sem', sortable: true },
    { key: 'section', header: 'Sec', sortable: true },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.academicStatus === 'active' ? 'green' : 'default'}>{r.academicStatus}</Badge> },
  ];

  const formFields = [
    { name: 'name', label: 'Full Name', required: true, path: 'user.name' },
    { name: 'email', label: 'Email', required: true, path: 'user.email' },
    { name: 'studentId', label: 'Student ID', required: true },
    { name: 'rollNumber', label: 'Roll Number', required: true },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: GENDERS.map((g) => ({ value: g, label: g })) },
    { name: 'phone', label: 'Phone' },
    { name: 'department', label: 'Department', type: 'select', required: true, options: departmentOptions },
    { name: 'course', label: 'Course', type: 'select', required: true, options: courseOptions },
    { name: 'year', label: 'Year', type: 'number', required: true },
    { name: 'semester', label: 'Semester', type: 'number', required: true },
    { name: 'section', label: 'Section', required: true },
    { name: 'admissionYear', label: 'Admission Year', type: 'number' },
    { name: 'batch', label: 'Batch (e.g. 2026-2030)' },
    { name: 'academicStatus', label: 'Status', type: 'select', options: STATUSES.map((s) => ({ value: s, label: s })) },
    { name: 'address', label: 'Address', type: 'textarea' },
    { name: 'guardianName', label: 'Guardian Name' },
    { name: 'guardianPhone', label: 'Guardian Phone' },
  ];

  const filterFields = [
    { key: 'search', type: 'text', placeholder: 'Search name, student ID, roll no.' },
    { key: 'department', type: 'select', placeholder: 'All Departments', options: departmentOptions },
    { key: 'course', type: 'select', placeholder: 'All Courses', options: courseOptions },
    { key: 'status', type: 'select', placeholder: 'All Statuses', options: STATUSES.map((s) => ({ value: s, label: s })) },
  ];

  return (
    <CrudManager
      title="Student"
      api={studentsApi}
      columns={columns}
      formFields={formFields}
      filterFields={filterFields}
      onRowClick={(row) => navigate(`/admin/students/${row._id}`)}
    />
  );
}
