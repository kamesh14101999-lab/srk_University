import { useEffect, useState } from 'react';
import { subjectsApi } from '../../api/subjects';
import { coursesApi } from '../../api/courses';
import CrudManager from '../../components/CrudManager';

const TYPES = ['theory', 'lab', 'elective'];

export default function AdminSubjects() {
  const [courseOptions, setCourseOptions] = useState([]);

  useEffect(() => {
    coursesApi.list({ limit: 100 }).then((d) => setCourseOptions(d.items.map((c) => ({ value: c._id, label: c.name }))));
  }, []);

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'code', header: 'Code', sortable: true },
    { key: 'course', header: 'Course', render: (r) => r.course?.name },
    { key: 'semester', header: 'Semester', sortable: true },
    { key: 'credits', header: 'Credits', sortable: true },
    { key: 'type', header: 'Type' },
  ];

  const formFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'code', label: 'Code', required: true },
    { name: 'course', label: 'Course', type: 'select', required: true, options: courseOptions },
    { name: 'semester', label: 'Semester', type: 'number', required: true },
    { name: 'credits', label: 'Credits', type: 'number', required: true },
    { name: 'type', label: 'Type', type: 'select', options: TYPES.map((t) => ({ value: t, label: t })) },
  ];

  return (
    <CrudManager
      title="Subject"
      api={subjectsApi}
      columns={columns}
      formFields={formFields}
      filterFields={[
        { key: 'search', type: 'text', placeholder: 'Search name or code' },
        { key: 'course', type: 'select', placeholder: 'All Courses', options: courseOptions },
        { key: 'type', type: 'select', placeholder: 'All Types', options: TYPES.map((t) => ({ value: t, label: t })) },
      ]}
    />
  );
}
