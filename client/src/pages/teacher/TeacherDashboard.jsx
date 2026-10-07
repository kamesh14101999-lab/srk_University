import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import DashboardHero from '../../components/DashboardHero';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatters';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardApi.teacher().then(setData);
  }, []);

  if (!data) return <Loader label="Loading dashboard..." />;

  const { classes, todayTimetable, lowAttendance, pendingMarkEntry } = data;

  if (classes.length === 0) {
    return <EmptyState title="No classes assigned yet" message="Contact the admin to be assigned a teaching assignment." />;
  }

  return (
    <div className="space-y-6">
      <DashboardHero eyebrow="Teacher" title={`Welcome back, ${user?.name}`} subtitle="Your classes, attendance, and marks at a glance." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">My Classes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {classes.map((c) => (
              <li key={c._id} className="flex justify-between">
                <span>{c.subject?.name}</span>
                <span className="text-gray-400">
                  {c.course?.name} · Sem {c.semester} {c.section}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">Today's Timetable</h2>
          {todayTimetable.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No classes today</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {todayTimetable.map((t) => (
                <li key={t._id} className="flex justify-between">
                  <span>{t.assignment?.subject?.name}</span>
                  <span className="text-gray-400">
                    {formatTime(t.startTime)} - {formatTime(t.endTime)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">Low Attendance Students</h2>
          {lowAttendance.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No students below threshold</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {lowAttendance.map((s, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {s.name} <span className="text-gray-400">({s.studentId})</span>
                  </span>
                  <Badge variant="red">{s.percent}%</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">Pending Mark Entry</h2>
          {pendingMarkEntry.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No pending exams</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {pendingMarkEntry.map((p, i) => (
                <li key={i} className="flex justify-between">
                  <span>{p.exam.name}</span>
                  <span className="text-gray-400">{p.marksEntered} entered</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
