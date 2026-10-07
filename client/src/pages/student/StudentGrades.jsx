import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/students';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { GRADE_COLOR_CLASSES } from '../../utils/constants';

export default function StudentGrades() {
  const { user } = useAuth();
  const studentId = user?.profile?._id;
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (studentId) studentsApi.results(studentId).then(setResults);
  }, [studentId]);

  if (!results) return <Loader />;
  if (results.length === 0) return <EmptyState title="No grades yet" message="Grades appear here once results are published." />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">My Grades</h1>
      {results.map((r) => (
        <div key={r._id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="mb-3 font-semibold text-gray-800">
            Semester {r.semester} · {r.academicYear?.label}
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Subject</th>
                <th className="pb-2">Percent</th>
                <th className="pb-2">Grade</th>
                <th className="pb-2">Grade Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {r.subjects.map((s, i) => (
                <tr key={i}>
                  <td className="py-2">{s.subject?.name}</td>
                  <td className="py-2">{s.percent}%</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${GRADE_COLOR_CLASSES[s.grade] || ''}`}>{s.grade}</span>
                  </td>
                  <td className="py-2">{s.gradePoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
