import { useEffect, useState } from 'react';
import { clubsApi } from '../../api/clubs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import CrudManager from '../../components/CrudManager';
import Modal from '../../components/Modal';
import { inputClass } from '../../components/FormField';

export default function ClubsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const readOnly = user?.role !== 'admin';

  const [membersClub, setMembersClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [newStudentId, setNewStudentId] = useState('');

  async function openMembers(club) {
    setMembersClub(club);
    const data = await clubsApi.members(club._id);
    setMembers(data);
  }

  async function handleAddMember() {
    if (!newStudentId) return;
    try {
      await clubsApi.addMember(membersClub._id, { student: newStudentId });
      showToast('Member added');
      setNewStudentId('');
      openMembers(membersClub);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  async function handleRemoveMember(studentId) {
    try {
      await clubsApi.removeMember(membersClub._id, studentId);
      showToast('Member removed');
      openMembers(membersClub);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'facultyCoordinator', header: 'Faculty Coordinator', render: (r) => r.facultyCoordinator?.user?.name || '-' },
    { key: 'studentCoordinator', header: 'Student Coordinator', render: (r) => r.studentCoordinator?.user?.name || '-' },
    {
      key: '__members',
      header: '',
      render: (r) => (
        <button type="button" onClick={() => openMembers(r)} className="text-primary-600 hover:underline">
          Members
        </button>
      ),
    },
  ];

  const formFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  return (
    <>
      <CrudManager
        title="Club"
        api={clubsApi}
        columns={columns}
        formFields={formFields}
        filterFields={[{ key: 'search', type: 'text', placeholder: 'Search name' }]}
        readOnly={readOnly}
      />

      <Modal open={!!membersClub} onClose={() => setMembersClub(null)} title={`${membersClub?.name} Members`}>
        <div className="space-y-3">
          {!readOnly && (
            <div className="flex gap-2">
              <input
                className={inputClass}
                placeholder="Student ObjectId"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
              />
              <button type="button" onClick={handleAddMember} className="rounded-md bg-primary-600 px-3 py-2 text-sm text-white">
                Add
              </button>
            </div>
          )}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {members.length === 0 && <p className="py-4 text-center text-sm text-gray-400">No members yet</p>}
            {members.map((m) => (
              <div key={m._id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {m.student?.user?.name} <span className="text-xs text-gray-400">({m.student?.studentId})</span>
                </span>
                {!readOnly && (
                  <button type="button" onClick={() => handleRemoveMember(m.student?._id)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
