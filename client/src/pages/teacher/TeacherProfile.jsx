import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

export default function TeacherProfile() {
  const { user } = useAuth();
  const profile = user?.profile;

  if (!profile) return <Loader />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
      <div className="flex items-center gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700">
          {user.name?.charAt(0)}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">
            {profile.employeeId} · {profile.department?.name} · {profile.designation}
          </p>
        </div>
      </div>

      <dl className="grid gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5 sm:grid-cols-2">
        <Field label="Email" value={user.email} />
        <Field label="Phone" value={profile.phone} />
        <Field label="Qualification" value={profile.qualification} />
        <Field label="Specialization" value={profile.specialization} />
        <Field label="Experience" value={profile.experienceYears ? `${profile.experienceYears} years` : '-'} />
        <Field label="Status" value={profile.status} />
      </dl>
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
