import { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendance';
import { departmentsApi } from '../../api/departments';
import { coursesApi } from '../../api/courses';
import FilterBar from '../../components/FilterBar';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';

export default function AdminAttendance() {
  const [filters, setFilters] = useState({});
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentsApi.list({ limit: 100 }).then((d) => setDepartmentOptions(d.items.map((x) => ({ value: x._id, label: x.name }))));
    coursesApi.list({ limit: 100 }).then((d) => setCourseOptions(d.items.map((x) => ({ value: x._id, label: x.name }))));
  }, []);

  useEffect(() => {
    setLoading(true);
    attendanceApi
      .analytics(filters)
      .then(setData)
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Attendance Analytics</h1>

      <FilterBar
        fields={[
          { key: 'department', type: 'select', placeholder: 'All Departments', options: departmentOptions },
          { key: 'course', type: 'select', placeholder: 'All Courses', options: courseOptions },
          { key: 'section', type: 'text', placeholder: 'Section' },
        ]}
        values={filters}
        onChange={setFilters}
      />

      {loading || !data ? (
        <Loader />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Attendance Threshold" value={`${data.threshold}%`} />
            <StatCard label="Warning Threshold" value={`${data.warning}%`} />
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="font-semibold text-gray-800">Department Averages</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {data.departmentAverages.map((d) => (
                <div key={d.department} className="rounded-md bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">{d.department}</p>
                  <p className="text-lg font-semibold text-primary-700">{d.average}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="font-semibold text-gray-800">Students Below Threshold</h2>
            {data.belowThreshold.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">No students below the threshold. 🎉</p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-2">Student ID</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Section</th>
                    <th className="pb-2">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.belowThreshold.map((s) => (
                    <tr key={s.student}>
                      <td className="py-2">{s.studentId}</td>
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">{s.section}</td>
                      <td className="py-2">
                        <Badge variant={s.percent >= data.warning ? 'amber' : 'red'}>{s.percent}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
