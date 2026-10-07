import { useEffect, useState } from 'react';
import { publicApi } from '../../api/public';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import PageBanner from '../../components/PageBanner';

export default function Departments() {
  const [departments, setDepartments] = useState(null);

  useEffect(() => {
    publicApi.departments().then(setDepartments);
  }, []);

  if (!departments) return <Loader />;

  return (
    <div>
      <PageBanner title="Departments" subtitle="Nine departments spanning engineering, management, science, and the arts." />
      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        {departments.length === 0 ? (
          <EmptyState title="No departments listed yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {departments.map((d) => (
              <div key={d._id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
                <p className="text-lg font-semibold text-gray-800">{d.name}</p>
                <p className="text-xs font-medium text-primary-600">{d.code}</p>
                <p className="mt-2 text-sm text-gray-600">{d.description || 'To be updated'}</p>
                <p className="mt-3 text-xs text-gray-500">Email: {d.email || 'To be updated'}</p>
                <p className="text-xs text-gray-500">Phone: {d.phone || 'To be updated'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
