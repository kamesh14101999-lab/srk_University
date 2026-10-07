import { useEffect, useState } from 'react';
import { universityApi } from '../../api/university';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import FormField, { inputClass } from '../../components/FormField';
import Loader from '../../components/Loader';

const TEXT_FIELDS = [
  ['overview', 'Overview'],
  ['history', 'History'],
  ['vision', 'Vision'],
  ['mission', 'Mission'],
  ['objectives', 'Objectives'],
  ['placementInfo', 'Placement Info'],
  ['studentSupport', 'Student Support'],
];

const CONTACT_FIELDS = [
  ['address', 'Address'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['mapEmbedUrl', 'Map Embed URL'],
  ['accreditation', 'Accreditation'],
  ['affiliation', 'Affiliation'],
  ['approvals', 'Approvals'],
];

export default function AdminUniversity() {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    universityApi.get().then(setForm);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await universityApi.update(form);
      setForm(updated);
      showToast('University information updated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">University Information</h1>
        <button type="button" onClick={handleSave} disabled={saving} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid gap-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
        {TEXT_FIELDS.map(([key, label]) => (
          <FormField key={key} label={label}>
            <textarea className={inputClass} rows={3} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </FormField>
        ))}
      </div>

      <div className="grid gap-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5 sm:grid-cols-2">
        {CONTACT_FIELDS.map(([key, label]) => (
          <FormField key={key} label={label}>
            <input className={inputClass} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </FormField>
        ))}
      </div>
    </div>
  );
}
