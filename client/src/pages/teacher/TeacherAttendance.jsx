import { useEffect, useState } from 'react';
import { teachingAssignmentsApi } from '../../api/teachingAssignments';
import { attendanceApi } from '../../api/attendance';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { inputClass } from '../../components/FormField';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherAttendance() {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState(null);
  const [assignmentId, setAssignmentId] = useState('');
  const [date, setDate] = useState(today());
  const [sheet, setSheet] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    teachingAssignmentsApi.list({ limit: 100 }).then((d) => setAssignments(d.items || []));
  }, []);

  useEffect(() => {
    if (assignmentId && date) {
      attendanceApi.getSheet(assignmentId, date).then(setSheet);
    }
  }, [assignmentId, date]);

  function toggleStatus(studentId) {
    setSheet((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.student === studentId ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s)),
    }));
  }

  function markAll(status) {
    setSheet((prev) => ({ ...prev, students: prev.students.map((s) => ({ ...s, status })) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await attendanceApi.saveSheet({
        assignment: assignmentId,
        date,
        records: sheet.students.map((s) => ({ student: s.student, status: s.status })),
      });
      showToast('Attendance saved');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!assignments) return <Loader />;
  if (assignments.length === 0) return <EmptyState title="No classes assigned yet" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Mark Attendance</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
        <select className={inputClass} value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}>
          <option value="">Select class...</option>
          {assignments.map((a) => (
            <option key={a._id} value={a._id}>
              {a.subject?.name} · {a.course?.name} Sem {a.semester} {a.section}
            </option>
          ))}
        </select>
        <input type="date" className={inputClass} value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
      </div>

      {assignmentId && !sheet && <Loader />}

      {sheet && (
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-black/5">
          <div className="flex justify-end gap-2 border-b border-gray-100 p-3">
            <button type="button" onClick={() => markAll('present')} className="rounded-md border border-gray-300 px-3 py-1 text-xs">
              Mark all present
            </button>
            <button type="button" onClick={() => markAll('absent')} className="rounded-md border border-gray-300 px-3 py-1 text-xs">
              Mark all absent
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Roll No.</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sheet.students.map((s) => (
                <tr key={s.student}>
                  <td className="px-4 py-2">{s.rollNumber}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => toggleStatus(s.student)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        s.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {s.status === 'present' ? 'Present' : 'Absent'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end border-t border-gray-100 p-4">
            <button type="button" onClick={handleSave} disabled={saving} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
