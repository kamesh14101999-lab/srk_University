import { useEffect, useState } from 'react';
import { examsApi } from '../../api/exams';
import { subjectsApi } from '../../api/subjects';
import { coursesApi } from '../../api/courses';
import { academicYearsApi } from '../../api/academicYears';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/formatters';
import CrudManager from '../../components/CrudManager';
import Badge from '../../components/Badge';

const TYPES = ['internal', 'midterm', 'assignment', 'practical', 'semester', 'supplementary'];

export default function AdminExams() {
  const { showToast } = useToast();
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    subjectsApi.list({ limit: 300 }).then((d) => setSubjectOptions(d.items.map((s) => ({ value: s._id, label: `${s.name} (${s.code})` }))));
    coursesApi.list({ limit: 100 }).then((d) => setCourseOptions(d.items.map((c) => ({ value: c._id, label: c.name }))));
    academicYearsApi.list({ limit: 20 }).then((d) => setYearOptions(d.items.map((y) => ({ value: y._id, label: y.label }))));
  }, []);

  async function togglePublish(exam) {
    try {
      if (exam.isPublished) {
        await examsApi.unpublish(exam._id);
        showToast('Exam unpublished');
      } else {
        await examsApi.publish(exam._id);
        showToast('Exam published');
      }
      setReloadKey((k) => k + 1);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'type', header: 'Type' },
    { key: 'subject', header: 'Subject', render: (r) => r.subject?.name },
    { key: 'course', header: 'Course', render: (r) => r.course?.name },
    { key: 'semester', header: 'Sem', sortable: true },
    { key: 'date', header: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'maxMarks', header: 'Max Marks', sortable: true },
    {
      key: 'isPublished',
      header: 'Status',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePublish(r);
          }}
        >
          <Badge variant={r.isPublished ? 'green' : 'amber'}>{r.isPublished ? 'Published' : 'Draft'}</Badge>
        </button>
      ),
    },
  ];

  const formFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: TYPES.map((t) => ({ value: t, label: t })) },
    { name: 'subject', label: 'Subject', type: 'select', required: true, options: subjectOptions },
    { name: 'course', label: 'Course', type: 'select', required: true, options: courseOptions },
    { name: 'semester', label: 'Semester', type: 'number', required: true },
    { name: 'academicYear', label: 'Academic Year', type: 'select', required: true, options: yearOptions },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'maxMarks', label: 'Max Marks', type: 'number', required: true },
  ];

  return (
    <CrudManager
      key={reloadKey}
      title="Exam"
      api={examsApi}
      columns={columns}
      formFields={formFields}
      filterFields={[
        { key: 'search', type: 'text', placeholder: 'Search exam name' },
        { key: 'type', type: 'select', placeholder: 'All Types', options: TYPES.map((t) => ({ value: t, label: t })) },
        { key: 'course', type: 'select', placeholder: 'All Courses', options: courseOptions },
      ]}
    />
  );
}
