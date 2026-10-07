import { useEffect, useState } from 'react';
import { announcementsApi } from '../../api/announcements';
import { teachingAssignmentsApi } from '../../api/teachingAssignments';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/formatters';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField, { inputClass } from '../../components/FormField';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

const CATEGORIES = ['general', 'exam', 'result', 'holiday', 'event', 'academic', 'alert'];

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', category: 'general', audience: 'all', assignment: '', isPinned: false });
  const [saving, setSaving] = useState(false);

  const canCreate = user?.role === 'admin' || user?.role === 'teacher';

  async function load() {
    setLoading(true);
    try {
      const data = await announcementsApi.list({ limit: 50 });
      setItems(data.items || []);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (user?.role === 'teacher') {
      teachingAssignmentsApi.list({ limit: 100 }).then((d) => setAssignments(d.items || []));
    }
  }, [user?.role]);

  function openCreate() {
    setForm({
      title: '',
      body: '',
      category: 'general',
      audience: user?.role === 'teacher' ? 'assignment' : 'all',
      assignment: '',
      isPinned: false,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await announcementsApi.create(form);
      showToast('Announcement posted');
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await announcementsApi.remove(deleting._id);
      showToast('Announcement deleted');
      setDeleting(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      setDeleting(null);
    }
  }

  function canModify(item) {
    return user?.role === 'admin' || item.createdBy?._id === user?.profile?._id;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Announcements</h1>
        {canCreate && (
          <button type="button" onClick={openCreate} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            + New Announcement
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState title="No announcements yet" />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {a.isPinned && <Badge variant="gold">Pinned</Badge>}
                    <Badge variant="primary">{a.category}</Badge>
                    <p className="font-medium text-gray-800">{a.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{a.body}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {a.createdBy?.name} · {formatDateTime(a.createdAt)} · audience: {a.audience}
                  </p>
                </div>
                {canModify(a) && (
                  <button type="button" onClick={() => setDeleting(a)} className="text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Announcement"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
              Cancel
            </button>
            <button type="submit" form="announcement-form" disabled={saving} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {saving ? 'Posting...' : 'Post'}
            </button>
          </>
        }
      >
        <form id="announcement-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" required>
            <input className={inputClass} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormField>
          <FormField label="Body" required>
            <textarea className={inputClass} rows={4} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </FormField>
          <FormField label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          {user?.role === 'admin' && (
            <FormField label="Audience">
              <select className={inputClass} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                {['all', 'teachers', 'students'].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {user?.role === 'teacher' && (
            <FormField label="My Class" required>
              <select className={inputClass} required value={form.assignment} onChange={(e) => setForm({ ...form, assignment: e.target.value })}>
                <option value="">Select a class...</option>
                {assignments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.subject?.name} · {a.course?.name} Sem {a.semester} {a.section}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {user?.role === 'admin' && (
            <FormField label="Pin this announcement">
              <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
            </FormField>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete announcement?"
        message="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
