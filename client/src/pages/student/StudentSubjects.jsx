import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subjectsApi } from '../../api/subjects';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

export default function StudentSubjects() {
  const { user } = useAuth();
  const profile = user?.profile;
  const [subjects, setSubjects] = useState(null);

  useEffect(() => {
    if (!profile) return;
    subjectsApi.list({ course: profile.course?._id, semester: profile.semester, limit: 50 }).then((d) => setSubjects(d.items || []));
  }, [profile]);

  if (!subjects) return <Loader />;
  if (subjects.length === 0) return <EmptyState title="No subjects found for your semester" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">My Subjects</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <div key={s._id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-800">{s.name}</p>
              <Badge variant="primary">{s.type}</Badge>
            </div>
            <p className="mt-1 text-xs text-gray-500">{s.code}</p>
            <p className="mt-2 text-sm text-gray-600">{s.credits} credits</p>
          </div>
        ))}
      </div>
    </div>
  );
}
