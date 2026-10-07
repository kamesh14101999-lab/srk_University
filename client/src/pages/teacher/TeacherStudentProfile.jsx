import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentsApi } from '../../api/students';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/formatters';
import { inputClass } from '../../components/FormField';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';

const TABS = ['Overview', 'Attendance', 'Marks', 'Results'];

export default function TeacherStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState(null);
  const [results, setResults] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    studentsApi.get(id).then(setStudent);
  }

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (tab === 'Attendance' && !attendance) studentsApi.attendance(id).then(setAttendance);
    if (tab === 'Marks' && !marks) studentsApi.marks(id).then(setMarks);
    if (tab === 'Results' && !results) studentsApi.results(id).then(setResults);
  }, [tab, id, attendance, marks, results]);

  async function handleAddRemark(e) {
    e.preventDefault();
    if (!remarkText.trim()) return;
    setSubmitting(true);
    try {
      await studentsApi.addRemark(id, remarkText);
      showToast('Remark added');
      setRemarkText('');
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!student) return <Loader />;

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => navigate('/teacher/students')} className="text-sm text-primary-600 hover:underline">
        ← Back to Students
      </button>

      <div className="flex items-center gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700">
          {student.user?.name?.charAt(0)}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{student.user?.name}</p>
          <p className="text-sm text-gray-500">
            {student.studentId} · Section {student.section} · Semester {student.semester}
          </p>
        </div>
      </div>

      <div className="flex gap-2 rounded-md bg-gray-100 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === t ? 'bg-white text-primary-700 shadow' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
        {tab === 'Overview' && (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Add Remark</p>
              <form onSubmit={handleAddRemark} className="flex gap-2">
                <input className={inputClass} placeholder="Write a remark..." value={remarkText} onChange={(e) => setRemarkText(e.target.value)} />
                <button type="submit" disabled={submitting} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  Add
                </button>
              </form>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Remarks</p>
              {student.remarks?.length === 0 ? (
                <p className="text-sm text-gray-400">No remarks yet</p>
              ) : (
                <ul className="space-y-2">
                  {student.remarks.map((r, i) => (
                    <li key={i} className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                      {r.text} <span className="ml-2 text-xs text-gray-400">{formatDate(r.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === 'Attendance' &&
          (attendance ? (
            <p className="text-sm text-gray-600">
              Overall: <span className="font-semibold">{attendance.overall.percent}%</span> ({attendance.overall.present}/{attendance.overall.total})
            </p>
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
                  <th className="pb-2">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {marks.map((m) => (
                  <tr key={m._id}>
                    <td className="py-2">{m.exam?.name}</td>
                    <td className="py-2">{m.exam?.subject?.name}</td>
                    <td className="py-2">
                      {m.isAbsent ? 'Absent' : `${m.obtained}/${m.exam?.maxMarks}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Loader />
          ))}

        {tab === 'Results' &&
          (results ? (
            results.length === 0 ? (
              <p className="text-sm text-gray-400">No results yet</p>
            ) : (
              <ul className="space-y-2">
                {results.map((r) => (
                  <li key={r._id} className="flex justify-between text-sm">
                    <span>Semester {r.semester}</span>
                    <Badge variant={r.status === 'pass' ? 'green' : 'red'}>
                      {r.percentage}% · SGPA {r.sgpa}
                    </Badge>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <Loader />
          ))}
      </div>
    </div>
  );
}
