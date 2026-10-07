import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-bold text-primary-700">404</p>
      <p className="text-lg text-gray-600">Page not found</p>
      <Link to="/" className="mt-4 rounded-md bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">
        Back to Home
      </Link>
    </div>
  );
}
