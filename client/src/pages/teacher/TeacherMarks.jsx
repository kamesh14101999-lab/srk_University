import { useEffect, useState } from 'react';
import { examsApi } from '../../api/exams';
import { marksApi } from '../../api/marks';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { inputClass } from '../../components/FormField';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

export default function TeacherMarks() {
  const { showToast } = useToast();
  const [exams, setExams] = useState(null);
  const [examId, setExamId] = useState('');
  const [sheet, setSheet] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    examsApi.list({ limit: 100 }).then((d) => setExams(d.items || []));
  }, []);

  useEffect(() => {
    if (examId) marksApi.getSheet(examId).then(setSheet);
  }, [examId]);

  const selectedExam = exams?.find((e) => e._id === examId);
  const locked = selectedExam?.isPublished;

  function updateRow(studentId, field, value) {
    setSheet((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.student === studentId ? { ...s, [field]: value } : s)),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await marksApi.saveSheet({
        exam: examId,
        records: sheet.students.map((s) => ({ student: s.student, obtained: Number(s.obtained) || 0, isAbsent: s.isAbsent })),
      });
      showToast('Marks saved');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!exams) return <Loader />;
  if (exams.length === 0) return <EmptyState title="No exams for your subjects yet" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Enter Marks</h1>

      <select className={`${inputClass} max-w-md`} value={examId} onChange={(e) => setExamId(e.target.value)}>
        <option value="">Select an exam...</option>
        {exams.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name} ({e.subject?.name}) {e.isPublished ? '· Published' : ''}
          </option>
        ))}
      </select>

      {locked && <Badge variant="amber">This exam is published and locked for editing</Badge>}

      {examId && !sheet && <Loader />}

      {sheet && (
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Roll No.</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Obtained (/{sheet.exam.maxMarks})</th>
                <th className="px-4 py-2">Absent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sheet.students.map((s) => (
                <tr key={s.student}>
                  <td className="px-4 py-2">{s.rollNumber}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      max={sheet.exam.maxMarks}
                      disabled={locked || s.isAbsent}
                      className={`${inputClass} w-24`}
                      value={s.obtained ?? ''}
                      onChange={(e) => updateRow(s.student, 'obtained', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input type="checkbox" disabled={locked} checked={s.isAbsent} onChange={(e) => updateRow(s.student, 'isAbsent', e.target.checked)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!locked && (
            <div className="flex justify-end border-t border-gray-100 p-4">
              <button type="button" onClick={handleSave} disabled={saving} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
