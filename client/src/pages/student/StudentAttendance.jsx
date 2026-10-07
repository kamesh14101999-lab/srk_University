import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/students';
import { attendanceApi } from '../../api/attendance';
import Loader from '../../components/Loader';
import { attendanceColor, ATTENDANCE_COLOR_CLASSES } from '../../utils/constants';

export default function StudentAttendance() {
  const { user } = useAuth();
  const studentId = user?.profile?._id;
  const [data, setData] = useState(null);
  const [monthly, setMonthly] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    studentsApi.attendance(studentId).then(setData);
    attendanceApi.summary({ student: studentId, groupBy: 'month' }).then(setMonthly);
  }, [studentId]);

  if (!data) return <Loader />;

  const color = attendanceColor(data.overall.percent);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">My Attendance</h1>

      <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm text-gray-500">Overall Attendance</p>
        <p className={`mt-1 inline-block rounded-full px-4 py-1.5 text-2xl font-semibold ${ATTENDANCE_COLOR_CLASSES[color]}`}>{data.overall.percent}%</p>
        <p className="mt-2 text-sm text-gray-500">
          {data.overall.present} present / {data.overall.total} classes held
        </p>
      </div>

      {monthly && monthly.length > 0 && (
        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-3 font-semibold text-gray-800">Monthly Attendance %</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="key" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="percent" fill="#2c4a9e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 font-semibold text-gray-800">Per-Subject Attendance</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pb-2">Subject</th>
              <th className="pb-2">Present</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.bySubject.map((row, i) => (
              <tr key={i}>
                <td className="py-2">{row.subject?.name}</td>
                <td className="py-2">{row.present}</td>
                <td className="py-2">{row.total}</td>
                <td className="py-2">{row.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
