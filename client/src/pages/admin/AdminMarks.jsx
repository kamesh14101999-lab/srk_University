import { useEffect, useState } from 'react';
import { examsApi } from '../../api/exams';
import { marksApi } from '../../api/marks';
import { gradingRulesApi } from '../../api/gradingRules';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { inputClass } from '../../components/FormField';
import Loader from '../../components/Loader';

export default function AdminMarks() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('entry');
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState('');
  const [sheet, setSheet] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    examsApi.list({ limit: 200 }).then((d) => setExams(d.items || []));
    gradingRulesApi.list().then(setRules);
  }, []);

  useEffect(() => {
    if (examId) marksApi.getSheet(examId).then(setSheet);
  }, [examId]);

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

  async function handleSaveRules() {
    try {
      const updated = await gradingRulesApi.replaceAll(rules.map((r) => ({ minPercent: Number(r.minPercent), grade: r.grade, gradePoint: Number(r.gradePoint) })));
      setRules(updated);
      showToast('Grading rules updated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Marks & Grades</h1>

      <div className="flex gap-2 rounded-md bg-gray-100 p-1 w-fit">
        <button type="button" onClick={() => setTab('entry')} className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === 'entry' ? 'bg-white text-primary-700 shadow' : 'text-gray-500'}`}>
          Marks Entry
        </button>
        <button type="button" onClick={() => setTab('grading')} className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === 'grading' ? 'bg-white text-primary-700 shadow' : 'text-gray-500'}`}>
          Grading Rules
        </button>
      </div>

      {tab === 'entry' && (
        <div className="space-y-4">
          <select className={`${inputClass} max-w-md`} value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="">Select an exam...</option>
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} ({e.subject?.name}) {e.isPublished ? '· Published' : ''}
              </option>
            ))}
          </select>

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
                          disabled={s.isAbsent}
                          className={`${inputClass} w-24`}
                          value={s.obtained ?? ''}
                          onChange={(e) => updateRow(s.student, 'obtained', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input type="checkbox" checked={s.isAbsent} onChange={(e) => updateRow(s.student, 'isAbsent', e.target.checked)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end border-t border-gray-100 p-4">
                <button type="button" onClick={handleSave} disabled={saving} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Marks'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'grading' && (
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Min Percent</th>
                <th className="pb-2">Grade</th>
                <th className="pb-2">Grade Point</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((r, i) => (
                <tr key={i}>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      className={`${inputClass} w-24`}
                      value={r.minPercent}
                      onChange={(e) => setRules((prev) => prev.map((x, j) => (j === i ? { ...x, minPercent: e.target.value } : x)))}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      className={`${inputClass} w-20`}
                      value={r.grade}
                      onChange={(e) => setRules((prev) => prev.map((x, j) => (j === i ? { ...x, grade: e.target.value } : x)))}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      className={`${inputClass} w-20`}
                      value={r.gradePoint}
                      onChange={(e) => setRules((prev) => prev.map((x, j) => (j === i ? { ...x, gradePoint: e.target.value } : x)))}
                    />
                  </td>
                  <td className="py-2">
                    <button type="button" onClick={() => setRules((prev) => prev.filter((_, j) => j !== i))} className="text-xs text-red-600 hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setRules((prev) => [...prev, { minPercent: 0, grade: '', gradePoint: 0 }])}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
            >
              + Add Rule
            </button>
            <button type="button" onClick={handleSaveRules} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white">
              Save Grading Rules
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
