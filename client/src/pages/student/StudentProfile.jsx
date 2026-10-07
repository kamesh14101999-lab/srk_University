import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import Loader from '../../components/Loader';

export default function StudentProfile() {
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
            {profile.studentId} · {profile.department?.name} · {profile.course?.name}
          </p>
        </div>
      </div>

      <dl className="grid gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5 sm:grid-cols-2">
        <Field label="Email" value={user.email} />
        <Field label="Roll Number" value={profile.rollNumber} />
        <Field label="Phone" value={profile.phone} />
        <Field label="DOB" value={formatDate(profile.dob)} />
        <Field label="Gender" value={profile.gender} />
        <Field label="Blood Group" value={profile.bloodGroup} />
        <Field label="Year" value={profile.year} />
        <Field label="Semester" value={profile.semester} />
        <Field label="Section" value={profile.section} />
        <Field label="Batch" value={profile.batch} />
        <Field label="Address" value={profile.address} />
        <Field label="Guardian Name" value={profile.guardianName} />
        <Field label="Guardian Phone" value={profile.guardianPhone} />
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
