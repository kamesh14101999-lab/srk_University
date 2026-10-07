export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
