import { useState } from 'react';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';

export default function ResetPasswordButton({ onReset, label = 'Reset Password' }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await onReset();
      setTempPassword(res.temporaryPassword);
      setConfirmOpen(false);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tempPassword);
      showToast('Password copied to clipboard');
    } catch {
      showToast('Could not copy — please copy it manually', 'error');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {label}
      </button>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset password?"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          This generates a new temporary password and immediately invalidates the current one. You'll need to
          share it with the user yourself — it's shown only once.
        </p>
      </Modal>

      <Modal open={!!tempPassword} onClose={() => setTempPassword(null)} title="New temporary password">
        <p className="mb-3 text-sm text-gray-600">
          Share this with the user now — it won't be shown again. They should change it after logging in.
        </p>
        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <code className="flex-1 font-mono text-sm text-gray-900">{tempPassword}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md bg-primary-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-700"
          >
            Copy
          </button>
        </div>
      </Modal>
    </>
  );
}
