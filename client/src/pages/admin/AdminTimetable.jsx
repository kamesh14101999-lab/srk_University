import { useEffect, useState } from 'react';
import { timetableApi } from '../../api/timetable';
import { teachingAssignmentsApi } from '../../api/teachingAssignments';
import { coursesApi } from '../../api/courses';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { inputClass } from '../../components/FormField';
import { DAYS } from '../../utils/constants';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminTimetable() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ course: '', semester: '', section: '' });
  const [entries, setEntries] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ assignment: '', day: 'Mon', startTime: '09:00', endTime: '10:00', room: '' });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    coursesApi.list({ limit: 100 }).then((d) => setCourses(d.items || []));
  }, []);

  async function loadEntries() {
    if (!filters.course || !filters.semester || !filters.section) return;
    const data = await timetableApi.list(filters);
    setEntries(data);
    const a = await teachingAssignmentsApi.list({ course: filters.course, semester: filters.semester, section: filters.section, limit: 100 });
    setAssignments(a.items || []);
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await timetableApi.create(form);
      showToast('Timetable entry added');
      loadEntries();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  async function handleDelete() {
    try {
      await timetableApi.remove(deleting._id);
      showToast('Entry removed');
      setDeleting(null);
      loadEntries();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      setDeleting(null);
    }
  }

  const entriesByDay = DAYS.reduce((acc, d) => {
    acc[d] = entries.filter((e) => e.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Timetable</h1>

      <div className="flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
        <select className={inputClass} value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Semester"
          className={`${inputClass} max-w-[120px]`}
          value={filters.semester}
          onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
        />
        <input
          placeholder="Section"
          className={`${inputClass} max-w-[120px]`}
          value={filters.section}
          onChange={(e) => setFilters({ ...filters, section: e.target.value })}
        />
      </div>

      {filters.course && filters.semester && filters.section && (
        <>
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
            <select required className={inputClass} value={form.assignment} onChange={(e) => setForm({ ...form, assignment: e.target.value })}>
              <option value="">Select subject/teacher...</option>
              {assignments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.subject?.name} · {a.teacher?.user?.name}
                </option>
              ))}
            </select>
            <select className={inputClass} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input type="time" className={inputClass} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <input type="time" className={inputClass} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            <input placeholder="Room" className={`${inputClass} max-w-[120px]`} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            <button type="submit" className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white">
              Add Entry
            </button>
          </form>

          <div className="grid gap-3 lg:grid-cols-6">
            {DAYS.map((day) => (
              <div key={day} className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5">
                <p className="mb-2 text-sm font-semibold text-gray-700">{day}</p>
                <div className="space-y-2">
                  {entriesByDay[day].length === 0 && <p className="text-xs text-gray-400">No classes</p>}
                  {entriesByDay[day].map((e) => (
                    <div key={e._id} className="rounded-md bg-primary-50 p-2 text-xs">
                      <p className="font-medium text-primary-800">{e.assignment?.subject?.name}</p>
                      <p className="text-primary-600">
                        {e.startTime} - {e.endTime}
                      </p>
                      <p className="text-gray-500">{e.room}</p>
                      <button type="button" onClick={() => setDeleting(e)} className="mt-1 text-red-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Remove timetable entry?"
        message="This will remove the class from the schedule."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
