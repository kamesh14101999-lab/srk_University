import { useState } from 'react';
import { reportsApi } from '../../api/reports';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { inputClass } from '../../components/FormField';

const REPORT_TYPES = [
  { value: 'students', label: 'Students' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'marks', label: 'Marks' },
  { value: 'grades', label: 'Grades' },
  { value: 'semester-results', label: 'Semester Results' },
  { value: 'department-performance', label: 'Department Performance' },
  { value: 'course-performance', label: 'Course Performance' },
  { value: 'event-participation', label: 'Event Participation' },
  { value: 'sports-participation', label: 'Sports Participation' },
  { value: 'achievements', label: 'Achievements' },
];

export default function AdminReports() {
  const { showToast } = useToast();
  const [type, setType] = useState('students');
  const [format, setFormat] = useState('xlsx');
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await reportsApi.download(type, format);
      showToast('Report downloaded');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Reports</h1>

      <div className="max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Report Type</label>
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Format</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={format === 'xlsx'} onChange={() => setFormat('xlsx')} /> Excel (.xlsx)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={format === 'pdf'} onChange={() => setFormat('pdf')} /> PDF
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="w-full rounded-md bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {downloading ? 'Preparing...' : 'Download Report'}
        </button>
      </div>
    </div>
  );
}
