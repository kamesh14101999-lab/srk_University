export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <p className="text-base font-medium text-gray-700">{title}</p>
      {message && <p className="max-w-sm text-sm text-gray-500">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
