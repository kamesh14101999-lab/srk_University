import { useEffect, useState } from 'react';
import { publicApi } from '../../api/public';
import Loader from '../../components/Loader';
import PageBanner from '../../components/PageBanner';

const SECTIONS = [
  ['overview', 'Overview'],
  ['history', 'History'],
  ['vision', 'Vision'],
  ['mission', 'Mission'],
  ['objectives', 'Objectives'],
  ['placementInfo', 'Placement & Training'],
  ['studentSupport', 'Student Support'],
];

export default function About() {
  const [university, setUniversity] = useState(null);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    publicApi.university().then(setUniversity);
    publicApi.facilities().then(setFacilities);
  }, []);

  if (!university) return <Loader label="Loading..." />;

  return (
    <div>
      <PageBanner title="About SKR University" subtitle="Our story, vision, and what makes our campus community thrive." />

      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <div className="space-y-8">
        {SECTIONS.map(([key, label]) => (
          <div key={key}>
            <h2 className="text-lg font-semibold text-primary-700">{label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{university[key] || 'To be updated'}</p>
          </div>
        ))}

        {university.leadership?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-primary-700">Leadership</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {university.leadership.map((l, i) => (
                <div key={i} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                  <p className="font-medium text-gray-800">{l.name}</p>
                  <p className="text-xs text-gray-500">{l.designation}</p>
                  <p className="mt-2 text-sm italic text-gray-600">&ldquo;{l.message}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-primary-700">Campus & Facilities</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f) => (
              <div key={f._id} className="rounded-lg border border-gray-100 p-4">
                <p className="font-medium text-gray-800">{f.name}</p>
                <p className="text-xs capitalize text-gray-500">{f.category.replace('_', ' ')}</p>
                {f.description && <p className="mt-1 text-xs text-gray-500">{f.description}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-primary-700">Accreditation & Affiliation</h2>
            <p className="mt-2 text-sm text-gray-600">{university.accreditation || 'To be updated'}</p>
            <p className="mt-1 text-sm text-gray-600">{university.affiliation || 'To be updated'}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-700">Approvals</h2>
            <p className="mt-2 text-sm text-gray-600">{university.approvals || 'To be updated'}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
