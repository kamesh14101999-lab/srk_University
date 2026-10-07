import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentsApi } from '../../api/students';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/formatters';
import { GRADE_COLOR_CLASSES } from '../../utils/constants';

const TABS = ['Personal', 'Academic', 'Attendance', 'Marks', 'Results', 'Activities'];

export default function AdminStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState('Personal');
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState(null);
  const [results, setResults] = useState(null);
  const [activities, setActivities] = useState(null);

  useEffect(() => {
    studentsApi.get(id).then(setStudent);
  }, [id]);

  useEffect(() => {
    if (tab === 'Attendance' && !attendance) studentsApi.attendance(id).then(setAttendance);
    if (tab === 'Marks' && !marks) studentsApi.marks(id).then(setMarks);
    if (tab === 'Results' && !results) studentsApi.results(id).then(setResults);
    if (tab === 'Activities' && !activities) studentsApi.activities(id).then(setActivities);
  }, [tab, id, attendance, marks, results, activities]);

  if (!student) return <Loader />;

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => navigate('/admin/students')} className="text-sm text-primary-600 hover:underline">
        ← Back to Students
      </button>

      <div className="flex items-center gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700">
          {student.user?.name?.charAt(0)}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{student.user?.name}</p>
          <p className="text-sm text-gray-500">
            {student.studentId} · {student.department?.name} · {student.course?.name}
          </p>
        </div>
        <Badge variant={student.academicStatus === 'active' ? 'green' : 'default'} className="ml-auto">
          {student.academicStatus}
        </Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-md bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${tab === t ? 'bg-white text-primary-700 shadow' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
        {tab === 'Personal' && (
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" value={student.user?.email} />
            <Field label="Phone" value={student.phone} />
            <Field label="DOB" value={formatDate(student.dob)} />
            <Field label="Gender" value={student.gender} />
            <Field label="Blood Group" value={student.bloodGroup} />
            <Field label="Address" value={student.address} />
            <Field label="Guardian Name" value={student.guardianName} />
            <Field label="Guardian Phone" value={student.guardianPhone} />
          </dl>
        )}

        {tab === 'Academic' && (
          <div className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Roll Number" value={student.rollNumber} />
              <Field label="Batch" value={student.batch} />
              <Field label="Year" value={student.year} />
              <Field label="Semester" value={student.semester} />
              <Field label="Section" value={student.section} />
              <Field label="Admission Year" value={student.admissionYear} />
            </dl>
            {student.remarks?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Teacher Remarks</p>
                <ul className="space-y-2">
                  {student.remarks.map((r, i) => (
                    <li key={i} className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                      {r.text}
                      <span className="ml-2 text-xs text-gray-400">{formatDate(r.date)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'Attendance' &&
          (attendance ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Overall: <span className="font-semibold">{attendance.overall.percent}%</span> ({attendance.overall.present}/{attendance.overall.total})
              </p>
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
                  {attendance.bySubject.map((row, i) => (
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
          ) : (
            <Loader />
          ))}

        {tab === 'Marks' &&
          (marks ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2">Exam</th>
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Obtained</th>
                  <th className="pb-2">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {marks.map((m) => (
                  <tr key={m._id}>
                    <td className="py-2">{m.exam?.name}</td>
                    <td className="py-2">{m.exam?.subject?.name}</td>
                    <td className="py-2">{m.isAbsent ? 'Absent' : m.obtained}</td>
                    <td className="py-2">{m.exam?.maxMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Loader />
          ))}

        {tab === 'Results' &&
          (results ? (
            <div className="space-y-6">
              {results.length === 0 && <p className="text-sm text-gray-400">No results yet</p>}
              {results.map((r) => (
                <div key={r._id}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-gray-800">
                      Semester {r.semester} · {r.academicYear?.label}
                    </p>
                    <Badge variant={r.status === 'pass' ? 'green' : 'red'}>{r.status}</Badge>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pb-2">Subject</th>
                        <th className="pb-2">Obtained</th>
                        <th className="pb-2">Max</th>
                        <th className="pb-2">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {r.subjects.map((s, i) => (
                        <tr key={i}>
                          <td className="py-2">{s.subject?.name}</td>
                          <td className="py-2">{s.obtained}</td>
                          <td className="py-2">{s.maxMarks}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${GRADE_COLOR_CLASSES[s.grade] || ''}`}>{s.grade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-sm text-gray-600">
                    Total: {r.totalObtained}/{r.totalMax} ({r.percentage}%) · SGPA {r.sgpa} · CGPA {r.cgpa}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <Loader />
          ))}

        {tab === 'Activities' &&
          (activities ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <ActivityList title="Events" items={activities.events} render={(e) => e.name} />
              <ActivityList title="Fests" items={activities.fests} render={(f) => f.name} />
              <ActivityList title="Clusters" items={activities.clusters} render={(c) => c.activityName} />
              <ActivityList title="Teams" items={activities.teams} render={(t) => `${t.name} (${t.sport?.name})`} />
              <ActivityList title="Clubs" items={activities.clubMemberships} render={(c) => c.club?.name} />
              <ActivityList title="Achievements" items={activities.achievements} render={(a) => a.title} />
            </div>
          ) : (
            <Loader />
          ))}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800">{value || '-'}</dd>
    </div>
  );
}

function ActivityList({ title, items, render }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-700">{title}</p>
      {!items || items.length === 0 ? (
        <p className="text-xs text-gray-400">None</p>
      ) : (
        <ul className="space-y-1 text-sm text-gray-600">
          {items.map((item, i) => (
            <li key={i}>{render(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
