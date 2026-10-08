import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teachersApi } from '../../api/teachers';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import ResetPasswordButton from '../../components/ResetPasswordButton';

export default function AdminTeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [workload, setWorkload] = useState(null);

  useEffect(() => {
    teachersApi.get(id).then(setTeacher);
    teachersApi.workload(id).then(setWorkload);
  }, [id]);

  if (!teacher) return <Loader />;

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => navigate('/admin/teachers')} className="text-sm text-primary-600 hover:underline">
        ← Back to Teachers
      </button>

      <div className="flex items-center gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700">
          {teacher.user?.name?.charAt(0)}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{teacher.user?.name}</p>
          <p className="text-sm text-gray-500">
            {teacher.employeeId} · {teacher.department?.name} · {teacher.designation}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant={teacher.status === 'active' ? 'green' : 'default'}>{teacher.status}</Badge>
          <ResetPasswordButton onReset={() => teachersApi.resetPassword(id)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-3 font-semibold text-gray-800">Details</h2>
          <dl className="grid gap-3">
            <Field label="Email" value={teacher.user?.email} />
            <Field label="Phone" value={teacher.phone} />
            <Field label="Qualification" value={teacher.qualification} />
            <Field label="Specialization" value={teacher.specialization} />
            <Field label="Experience" value={teacher.experienceYears ? `${teacher.experienceYears} years` : '-'} />
          </dl>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-3 font-semibold text-gray-800">Workload</h2>
          {!workload ? (
            <Loader />
          ) : (
            <>
              <p className="text-sm text-gray-600">Weekly teaching hours: {workload.weeklyHours}h</p>
              <ul className="mt-3 space-y-2 text-sm">
                {workload.assignments.map((a) => (
                  <li key={a._id} className="flex justify-between">
                    <span>
                      {a.subject?.name} · {a.course?.name} Sem {a.semester} {a.section}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800">{value || '-'}</dd>
    </div>
  );
}
