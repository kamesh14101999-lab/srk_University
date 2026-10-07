export default function StatCard({ label, value, icon, accent = 'primary' }) {
  const accentClasses = {
    primary: 'bg-primary-50 text-primary-600',
    gold: 'bg-gold-500/15 text-gold-600',
  };

  return (
    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
      {icon && (
        <div className={`flex h-10 w-10 items-center justify-center rounded-md text-lg ${accentClasses[accent] || accentClasses.primary}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
