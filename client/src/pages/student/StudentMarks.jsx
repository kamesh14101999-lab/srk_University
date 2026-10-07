import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/students';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function StudentMarks() {
  const { user } = useAuth();
  const studentId = user?.profile?._id;
  const [marks, setMarks] = useState(null);

  useEffect(() => {
    if (studentId) studentsApi.marks(studentId).then(setMarks);
  }, [studentId]);

  if (!marks) return <Loader />;
  if (marks.length === 0) return <EmptyState title="No published marks yet" message="Marks appear here once your teacher publishes the exam." />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">My Marks</h1>
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-2">Exam</th>
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Obtained</th>
              <th className="px-4 py-2">Max</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {marks.map((m) => (
              <tr key={m._id}>
                <td className="px-4 py-2">{m.exam?.name}</td>
                <td className="px-4 py-2">{m.exam?.subject?.name}</td>
                <td className="px-4 py-2">{m.isAbsent ? 'Absent' : m.obtained}</td>
                <td className="px-4 py-2">{m.exam?.maxMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
