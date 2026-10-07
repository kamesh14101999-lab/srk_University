export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <p className="text-lg font-medium text-gray-700">{title}</p>
      <p className="text-sm text-gray-400">This screen is under construction.</p>
    </div>
  );
}
