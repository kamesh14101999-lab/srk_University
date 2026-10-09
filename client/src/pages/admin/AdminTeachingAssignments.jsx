import { useEffect, useState } from 'react';
import { teachingAssignmentsApi } from '../../api/teachingAssignments';
import { teachersApi } from '../../api/teachers';
import { subjectsApi } from '../../api/subjects';
import { coursesApi } from '../../api/courses';
import { academicYearsApi } from '../../api/academicYears';
import CrudManager from '../../components/CrudManager';

export default function AdminTeachingAssignments() {
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(() => {
    teachersApi.list({ limit: 200 }).then((d) => setTeacherOptions(d.items.map((t) => ({ value: t._id, label: `${t.user?.name} (${t.employeeId})` }))));
    subjectsApi.list({ limit: 300 }).then((d) => setSubjectOptions(d.items.map((s) => ({ value: s._id, label: `${s.name} (${s.code})` }))));
    coursesApi.list({ limit: 100 }).then((d) => setCourseOptions(d.items.map((c) => ({ value: c._id, label: c.name }))));
    academicYearsApi.list({ limit: 20 }).then((d) => setYearOptions(d.items.map((y) => ({ value: y._id, label: y.label }))));
  }, []);

  const columns = [
    { key: 'teacher', header: 'Teacher', render: (r) => r.teacher?.user?.name },
    { key: 'subject', header: 'Subject', render: (r) => r.subject?.name },
    { key: 'course', header: 'Course', render: (r) => r.course?.name },
    { key: 'semester', header: 'Semester', sortable: true },
    { key: 'section', header: 'Section', sortable: true },
    { key: 'academicYear', header: 'Year', render: (r) => r.academicYear?.label },
  ];

  const formFields = [
    { name: 'teacher', label: 'Teacher', type: 'select', required: true, options: teacherOptions },
    { name: 'subject', label: 'Subject', type: 'select', required: true, options: subjectOptions },
    { name: 'course', label: 'Course', type: 'select', required: true, options: courseOptions },
    { name: 'semester', label: 'Semester', type: 'number', required: true },
    { name: 'section', label: 'Section', required: true },
    { name: 'academicYear', label: 'Academic Year', type: 'select', required: true, options: yearOptions },
  ];

  const filterFields = [
    { key: 'search', type: 'text', placeholder: 'Search teacher, subject, course' },
    { key: 'teacher', type: 'select', placeholder: 'All Teachers', options: teacherOptions },
    { key: 'course', type: 'select', placeholder: 'All Courses', options: courseOptions },
    { key: 'subject', type: 'select', placeholder: 'All Subjects', options: subjectOptions },
    { key: 'academicYear', type: 'select', placeholder: 'All Years', options: yearOptions },
  ];

  return (
    <CrudManager
      title="Teaching Assignment"
      api={teachingAssignmentsApi}
      columns={columns}
      formFields={formFields}
      filterFields={filterFields}
    />
  );
}
