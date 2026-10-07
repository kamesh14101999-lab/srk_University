import { useEffect, useState } from 'react';
import { timetableApi } from '../../api/timetable';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { DAYS } from '../../utils/constants';

export default function TeacherTimetable() {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    timetableApi.me().then(setEntries);
  }, []);

  if (!entries) return <Loader />;
  if (entries.length === 0) return <EmptyState title="No timetable entries yet" />;

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = entries.filter((e) => e.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">My Timetable</h1>
      <div className="grid gap-3 lg:grid-cols-6">
        {DAYS.map((day) => (
          <div key={day} className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5">
            <p className="mb-2 text-sm font-semibold text-gray-700">{day}</p>
            <div className="space-y-2">
              {byDay[day].length === 0 && <p className="text-xs text-gray-400">No classes</p>}
              {byDay[day].map((e) => (
                <div key={e._id} className="rounded-md bg-primary-50 p-2 text-xs">
                  <p className="font-medium text-primary-800">{e.assignment?.subject?.name}</p>
                  <p className="text-primary-600">
                    {e.startTime} - {e.endTime}
                  </p>
                  <p className="text-gray-500">
                    {e.assignment?.course?.name} · {e.room}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
