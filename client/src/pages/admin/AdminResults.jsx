import { useEffect, useState } from 'react';
import { resultsApi } from '../../api/results';
import { coursesApi } from '../../api/courses';
import { academicYearsApi } from '../../api/academicYears';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { inputClass } from '../../components/FormField';
import Table from '../../components/Table';
import Badge from '../../components/Badge';

export default function AdminResults() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [filters, setFilters] = useState({ course: '', semester: '', academicYear: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    coursesApi.list({ limit: 100 }).then((d) => setCourses(d.items || []));
    academicYearsApi.list({ limit: 20 }).then((d) => setYears(d.items || []));
  }, []);

  async function loadResults() {
    setLoading(true);
    try {
      const data = await resultsApi.list({ ...filters, limit: 100 });
      setResults(data.items || []);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  async function runAction(action, successMsg) {
    if (!filters.course || !filters.semester || !filters.academicYear) {
      showToast('Select course, semester, and academic year first', 'error');
      return;
    }
    setBusy(true);
    try {
      await action({ course: filters.course, semester: Number(filters.semester), academicYear: filters.academicYear });
      showToast(successMsg);
      loadResults();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    { key: 'studentId', header: 'Student ID', render: (r) => r.student?.studentId },
    { key: 'name', header: 'Name', render: (r) => r.student?.user?.name },
    { key: 'course', header: 'Course', render: (r) => r.course?.name },
    { key: 'semester', header: 'Sem' },
    { key: 'percentage', header: 'Percentage' },
    { key: 'sgpa', header: 'SGPA' },
    { key: 'cgpa', header: 'CGPA' },
    { key: 'status', header: 'Result', render: (r) => <Badge variant={r.status === 'pass' ? 'green' : 'red'}>{r.status}</Badge> },
    { key: 'isPublished', header: 'Published', render: (r) => <Badge variant={r.isPublished ? 'green' : 'amber'}>{r.isPublished ? 'Yes' : 'No'}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Results</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
        <select className={inputClass} value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Semester"
          className={`${inputClass} max-w-[120px]`}
          value={filters.semester}
          onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
        />
        <select className={inputClass} value={filters.academicYear} onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}>
          <option value="">Select Academic Year</option>
          {years.map((y) => (
            <option key={y._id} value={y._id}>
              {y.label}
            </option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction(resultsApi.generate, 'Results generated')}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Generate
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction(resultsApi.publish, 'Results published')}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Publish
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction(resultsApi.unpublish, 'Results unpublished')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-60"
          >
            Unpublish
          </button>
        </div>
      </div>

      <Table columns={columns} rows={results} loading={loading} emptyMessage="No results generated yet" />
    </div>
  );
}
