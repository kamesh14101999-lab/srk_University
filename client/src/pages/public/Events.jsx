import { useEffect, useState } from 'react';
import { publicApi } from '../../api/public';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/formatters';
import PageBanner from '../../components/PageBanner';

export default function Events() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    publicApi.events().then(setEvents);
  }, []);

  if (!events) return <Loader />;

  return (
    <div>
      <PageBanner title="Events" subtitle="Cultural, technical, and academic events happening on campus." />
      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        {events.length === 0 ? (
          <EmptyState title="No events yet" />
        ) : (
          <div className="space-y-4">
            {events.map((e) => (
              <div key={e._id} className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <div>
                  <p className="font-medium text-gray-800">{e.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(e.date)} · {e.venue}
                  </p>
                </div>
                <Badge variant={e.status === 'completed' ? 'default' : 'primary'}>{e.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
