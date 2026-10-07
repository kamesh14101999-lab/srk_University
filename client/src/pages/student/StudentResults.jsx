import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/students';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { GRADE_COLOR_CLASSES } from '../../utils/constants';

export default function StudentResults() {
  const { user } = useAuth();
  const studentId = user?.profile?._id;
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (studentId) studentsApi.results(studentId).then(setResults);
  }, [studentId]);

  if (!results) return <Loader />;
  if (results.length === 0) return <EmptyState title="Results not yet published" message="Check back once your university publishes semester results." />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">My Results</h1>
      {results.map((r) => (
        <div key={r._id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-gray-800">
              Semester {r.semester} · {r.academicYear?.label}
            </p>
            <Badge variant={r.status === 'pass' ? 'green' : 'red'}>{r.status}</Badge>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Subject</th>
                <th className="pb-2">Max Marks</th>
                <th className="pb-2">Obtained Marks</th>
                <th className="pb-2">Grade</th>
                <th className="pb-2">Grade Point</th>
                <th className="pb-2">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {r.subjects.map((s, i) => (
                <tr key={i}>
                  <td className="py-2">{s.subject?.name}</td>
                  <td className="py-2">{s.maxMarks}</td>
                  <td className="py-2">{s.obtained}</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${GRADE_COLOR_CLASSES[s.grade] || ''}`}>{s.grade}</span>
                  </td>
                  <td className="py-2">{s.gradePoint}</td>
                  <td className="py-2 capitalize">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat label="Total" value={`${r.totalObtained}/${r.totalMax}`} />
            <SummaryStat label="Percentage" value={`${r.percentage}%`} />
            <SummaryStat label="SGPA" value={r.sgpa} />
            <SummaryStat label="CGPA" value={r.cgpa} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-md bg-gray-50 p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-primary-700">{value}</p>
    </div>
  );
}
