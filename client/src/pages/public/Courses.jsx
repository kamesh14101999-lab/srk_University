import { useEffect, useState } from 'react';
import { publicApi } from '../../api/public';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import PageBanner from '../../components/PageBanner';

export default function Courses() {
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    publicApi.courses().then(setCourses);
  }, []);

  if (!courses) return <Loader />;

  return (
    <div>
      <PageBanner title="Courses Offered" subtitle="UG, PG, diploma, and certificate programs across every department." />
      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <div key={c._id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-800">{c.name}</p>
                <Badge variant="primary">{c.degreeType}</Badge>
              </div>
              <p className="mt-1 text-xs text-gray-500">{c.department?.name}</p>
              <p className="mt-3 text-sm text-gray-600">
                Duration: {c.durationYears} years · {c.totalSemesters} semesters
              </p>
              {c.eligibility && <p className="mt-1 text-sm text-gray-600">Eligibility: {c.eligibility}</p>}
              {c.description && <p className="mt-2 text-sm text-gray-500">{c.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
