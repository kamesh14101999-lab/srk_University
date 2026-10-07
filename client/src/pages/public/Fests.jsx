import { useEffect, useState } from 'react';
import { publicApi } from '../../api/public';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatters';
import PageBanner from '../../components/PageBanner';

export default function Fests() {
  const [fests, setFests] = useState(null);

  useEffect(() => {
    publicApi.fests().then(setFests);
  }, []);

  if (!fests) return <Loader />;

  const [current, ...previous] = fests;

  return (
    <div>
      <PageBanner title="University Fests" subtitle="SKR Utsav and other annual celebrations, past and present." />
      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      {current && (
        <div className="mt-8 rounded-lg bg-primary-800 p-6 text-white">
          <p className="text-xl font-semibold">{current.name}</p>
          <p className="mt-1 text-sm text-white/70">
            {formatDate(current.startDate)} - {formatDate(current.endDate)} · {current.venue}
          </p>
          <p className="mt-3 text-sm text-white/80">{current.description}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {current.programs?.map((p, i) => (
              <div key={i} className="rounded-md bg-white/10 px-3 py-2 text-sm">
                {p.title} <span className="text-xs text-white/60">({p.category})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {previous.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-primary-700">Previous Fests</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {previous.map((f) => (
              <div key={f._id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <p className="font-medium text-gray-800">{f.name}</p>
                <p className="text-xs text-gray-500">{f.year}</p>
                {f.winners?.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-xs text-gray-500">
                    {f.winners.map((w, i) => (
                      <li key={i}>
                        {w.program}: {w.position} — {w.teamName || 'Winner'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
