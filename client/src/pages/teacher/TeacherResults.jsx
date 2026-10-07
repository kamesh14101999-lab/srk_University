import { useEffect, useState } from 'react';
import { resultsApi } from '../../api/results';
import { analyticsApi } from '../../api/analytics';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Loader from '../../components/Loader';

export default function TeacherResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    resultsApi
      .list({ limit: 100 })
      .then((d) => setResults(d.items || []))
      .finally(() => setLoading(false));
    analyticsApi.teacher().then(setAnalytics);
  }, []);

  const columns = [
    { key: 'studentId', header: 'Student ID', render: (r) => r.student?.studentId },
    { key: 'name', header: 'Name', render: (r) => r.student?.user?.name },
    { key: 'semester', header: 'Sem' },
    { key: 'percentage', header: 'Percentage' },
    { key: 'sgpa', header: 'SGPA' },
    { key: 'status', header: 'Result', render: (r) => <Badge variant={r.status === 'pass' ? 'green' : 'red'}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Results</h1>

      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analytics.map((a, i) => (
            <div key={i} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
              <p className="font-medium text-gray-800">
                {a.assignment.subject?.name} · Sem {a.assignment.semester} {a.assignment.section}
              </p>
              <p className="mt-1 text-sm text-gray-500">Class average: {a.classAverage}</p>
              <p className="text-sm text-gray-500">Students: {a.studentCount}</p>
            </div>
          ))}
        </div>
      )}

      <Table columns={columns} rows={results} loading={loading} emptyMessage="No results for your classes yet" />
    </div>
  );
}
