import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import DashboardHero from '../../components/DashboardHero';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime } from '../../utils/formatters';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardApi.admin().then(setData);
  }, []);

  if (!data) return <Loader label="Loading dashboard..." />;

  const { counts, upcomingEvents, upcomingExams, recentResults, recentAnnouncements, upcomingTournaments, attendanceOverview } = data;

  return (
    <div className="space-y-6">
      <DashboardHero eyebrow="Admin" title={`Welcome back, ${user?.name}`} subtitle="Here's what's happening across SKR University today." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={counts.totalStudents} icon="🎓" />
        <StatCard label="Active Students" value={counts.activeStudents} icon="✅" />
        <StatCard label="Total Teachers" value={counts.totalTeachers} icon="🧑‍🏫" />
        <StatCard label="Departments" value={counts.totalDepartments} icon="🏛️" />
        <StatCard label="Courses" value={counts.totalCourses} icon="📚" accent="gold" />
        <StatCard label="Upcoming Events" value={counts.upcomingEventsCount} icon="🎉" />
        <StatCard label="Upcoming Exams" value={counts.upcomingExamsCount} icon="📝" />
        <StatCard
          label="Attendance Health"
          value={`${attendanceOverview.green}🟢 / ${attendanceOverview.amber}🟡 / ${attendanceOverview.red}🔴`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">Upcoming Events</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {upcomingEvents.length === 0 && <li className="text-gray-400">No upcoming events</li>}
            {upcomingEvents.map((e) => (
              <li key={e._id} className="flex justify-between">
                <span>{e.name}</span>
                <span className="text-gray-400">{formatDate(e.date)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">Upcoming Exams</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {upcomingExams.length === 0 && <li className="text-gray-400">No upcoming exams</li>}
            {upcomingExams.map((e) => (
              <li key={e._id} className="flex justify-between">
                <span>
                  {e.name} <span className="text-gray-400">({e.subject?.name})</span>
                </span>
                <span className="text-gray-400">{formatDate(e.date)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">Recent Published Results</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {recentResults.length === 0 && <li className="text-gray-400">No results published yet</li>}
            {recentResults.map((r) => (
              <li key={r._id} className="flex justify-between">
                <span>{r.student?.studentId}</span>
                <span className="text-gray-400">Sem {r.semester} · {r.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <h2 className="font-semibold text-gray-800">Sports Overview</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {upcomingTournaments.length === 0 && <li className="text-gray-400">No tournaments scheduled</li>}
            {upcomingTournaments.map((t) => (
              <li key={t._id} className="flex justify-between">
                <span>
                  {t.name} <span className="text-gray-400">({t.sport?.name})</span>
                </span>
                <Badge variant="primary">{t.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Announcements</h2>
          <Link to="/admin/announcements" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        <ul className="mt-3 space-y-3 text-sm">
          {recentAnnouncements.length === 0 && <li className="text-gray-400">No announcements yet</li>}
          {recentAnnouncements.map((a) => (
            <li key={a._id}>
              <p className="font-medium text-gray-800">{a.title}</p>
              <p className="text-xs text-gray-400">{formatDateTime(a.createdAt)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
