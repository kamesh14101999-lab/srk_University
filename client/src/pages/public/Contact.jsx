import { useEffect, useState } from 'react';
import { publicApi } from '../../api/public';
import Loader from '../../components/Loader';
import PageBanner from '../../components/PageBanner';

export default function Contact() {
  const [university, setUniversity] = useState(null);

  useEffect(() => {
    publicApi.university().then(setUniversity);
  }, []);

  if (!university) return <Loader />;

  return (
    <div>
      <PageBanner title="Contact Us" subtitle="Reach out to the university office with any questions." />
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <div className="space-y-3 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Address: </span>
            {university.address || 'To be updated'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Email: </span>
            {university.email || 'To be updated'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Phone: </span>
            {university.phone || 'To be updated'}
          </p>
        </div>

        {university.mapEmbedUrl ? (
          <div className="mt-6 overflow-hidden rounded-lg shadow-sm">
            <iframe title="Campus location" src={university.mapEmbedUrl} className="h-80 w-full border-0" loading="lazy" />
          </div>
        ) : (
          <p className="mt-6 text-sm text-gray-400">Campus map to be updated.</p>
        )}
      </div>
    </div>
  );
}
