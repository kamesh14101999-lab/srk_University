import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboard';
import Loader from '../../components/Loader';
import DashboardHero from '../../components/DashboardHero';
import { attendanceColor, ATTENDANCE_COLOR_CLASSES } from '../../utils/constants';
import { formatDate, formatTime } from '../../utils/formatters';

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardApi.student().then(setData);
  }, []);

  if (!data) return <Loader label="Loading dashboard..." />;

  const { profile, attendance, latestResult, todayTimetable, upcomingExams, upcomingEvents, notifications } = data;
  const color = attendanceColor(attendance.percent);

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Student"
        title={`Welcome back, ${profile.user?.name}`}
        subtitle={`${profile.studentId} · ${profile.department?.name} · ${profile.course?.name} · Sem ${profile.semester}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-medium text-gray-500">Attendance</p>
          <p className={`mt-1 inline-block rounded-full px-3 py-1 text-lg font-semibold ${ATTENDANCE_COLOR_CLASSES[color]}`}>{attendance.percent}%</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-medium text-gray-500">Latest SGPA</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{latestResult?.sgpa ?? '-'}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-medium text-gray-500">CGPA</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{latestResult?.cgpa ?? '-'}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-medium text-gray-500">Notifications</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{notifications.filter((n) => !n.isRead).length} unread</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
          <h2 className="font-semibold text-gray-800">Upcoming Exams</h2>
          {upcomingExams.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No upcoming exams</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {upcomingExams.map((e) => (
                <li key={e._id} className="flex justify-between">
                  <span>
                    {e.name} ({e.subject?.name})
                  </span>
                  <span className="text-gray-400">{formatDate(e.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No upcoming events</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {upcomingEvents.map((e) => (
                <li key={e._id} className="flex justify-between">
                  <span>{e.name}</span>
                  <span className="text-gray-400">{formatDate(e.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No notifications</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {notifications.slice(0, 5).map((n) => (
                <li key={n._id}>
                  <p className="font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
