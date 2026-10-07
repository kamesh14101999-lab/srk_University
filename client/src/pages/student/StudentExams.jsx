import { useEffect, useState } from 'react';
import { examsApi } from '../../api/exams';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/formatters';

export default function StudentExams() {
  const [exams, setExams] = useState(null);

  useEffect(() => {
    examsApi.list({ limit: 50 }).then((d) => setExams(d.items || []));
  }, []);

  if (!exams) return <Loader />;
  if (exams.length === 0) return <EmptyState title="No exams scheduled yet" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Examinations</h1>
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-2">Exam</th>
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Max Marks</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {exams.map((e) => (
              <tr key={e._id}>
                <td className="px-4 py-2">{e.name}</td>
                <td className="px-4 py-2">{e.subject?.name}</td>
                <td className="px-4 py-2 capitalize">{e.type}</td>
                <td className="px-4 py-2">{formatDate(e.date)}</td>
                <td className="px-4 py-2">{e.maxMarks}</td>
                <td className="px-4 py-2">
                  <Badge variant={e.isPublished ? 'green' : 'amber'}>{e.isPublished ? 'Published' : 'Upcoming'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
