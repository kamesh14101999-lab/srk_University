import { useEffect, useState } from 'react';
import { teachingAssignmentsApi } from '../../api/teachingAssignments';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function TeacherClasses() {
  const [assignments, setAssignments] = useState(null);

  useEffect(() => {
    teachingAssignmentsApi.list({ limit: 100 }).then((d) => setAssignments(d.items || []));
  }, []);

  if (!assignments) return <Loader />;
  if (assignments.length === 0) return <EmptyState title="No classes assigned yet" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">My Classes</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assignments.map((a) => (
          <div key={a._id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
            <p className="font-semibold text-gray-800">{a.subject?.name}</p>
            <p className="text-xs text-gray-500">{a.subject?.code}</p>
            <p className="mt-2 text-sm text-gray-600">{a.course?.name}</p>
            <p className="text-sm text-gray-600">
              Semester {a.semester} · Section {a.section}
            </p>
            <p className="mt-1 text-xs text-gray-400">{a.academicYear?.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
