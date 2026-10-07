export default function Pagination({ page, pages, total, onChange }) {
  if (!pages || pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-3 text-sm text-gray-600">
      <span>
        Page {page} of {pages} ({total} total)
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
