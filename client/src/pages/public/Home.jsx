import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../../api/public';
import { formatDate } from '../../utils/formatters';
import Loader from '../../components/Loader';

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      publicApi.university(),
      publicApi.departments(),
      publicApi.courses(),
      publicApi.faculty(),
      publicApi.events(),
      publicApi.fests(),
      publicApi.announcements(),
    ]).then(([university, departments, courses, faculty, events, fests, announcements]) => {
      setData({ university, departments, courses, faculty, events, fests, announcements });
    });
  }, []);

  if (!data) return <Loader label="Loading home page..." />;

  const { university, departments, courses, faculty, events, fests, announcements } = data;

  return (
    <div>
      <section className="relative overflow-hidden py-28 text-center text-white sm:py-36">
        <img src="/images/campus-hero.jpg" alt="SKR University campus" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-900/70 to-primary-900/90" />
        <div className="relative mx-auto max-w-3xl px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">Welcome to</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">SKR University</h1>
          <p className="mt-3 text-lg text-white/80">Visakhapatnam, Andhra Pradesh, India</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70">{university.overview}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/courses" className="rounded-md bg-gold-500 px-6 py-2.5 text-sm font-semibold text-primary-900 hover:bg-gold-400">
              Explore Courses
            </Link>
            <Link to="/login" className="rounded-md border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
              Portal Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-primary-800">Vision</h2>
            <p className="mt-2 text-sm text-gray-600">{university.vision || 'To be updated'}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-800">Mission</h2>
            <p className="mt-2 text-sm text-gray-600">{university.mission || 'To be updated'}</p>
          </div>
        </div>
      </section>

      {university.leadership?.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
            {university.leadership.map((l, i) => (
              <div key={i}>
                <h2 className="text-lg font-semibold text-primary-800">{l.designation}'s Message</h2>
                <p className="mt-3 text-sm italic text-gray-600">&ldquo;{l.message}&rdquo;</p>
                <p className="mt-2 text-sm font-medium text-gray-800">{l.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <h2 className="text-xl font-semibold text-primary-800">Departments</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <div key={d._id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
              <p className="font-medium text-gray-800">{d.name}</p>
              <p className="text-xs text-gray-500">{d.code}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-xl font-semibold text-primary-800">Courses Offered</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 9).map((c) => (
              <div key={c._id} className="rounded-lg border border-gray-100 p-4">
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-500">
                  {c.degreeType} · {c.durationYears} years
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <h2 className="text-xl font-semibold text-primary-800">Faculty</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {faculty.slice(0, 8).map((f, i) => (
            <div key={i} className="rounded-lg bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700">
                {f.name?.charAt(0)}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-800">{f.name}</p>
              <p className="text-xs text-gray-500">{f.designation}</p>
              <p className="text-xs text-gray-400">{f.department?.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-xl font-semibold text-primary-800">Upcoming Events</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 6).map((e) => (
              <div key={e._id} className="rounded-lg border border-gray-100 p-4">
                <p className="font-medium text-gray-800">{e.name}</p>
                <p className="text-xs text-gray-500">{formatDate(e.date)}</p>
                <p className="mt-1 text-xs capitalize text-gray-400">{e.type?.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {fests?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <h2 className="text-xl font-semibold text-primary-800">University Fests</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fests.slice(0, 3).map((f) => (
              <div key={f._id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                <p className="font-medium text-gray-800">{f.name}</p>
                <p className="text-xs text-gray-500">{f.year}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <h2 className="text-xl font-semibold text-primary-800">Latest Announcements</h2>
          <div className="mt-6 space-y-3">
            {announcements.length === 0 && <p className="text-sm text-gray-500">No announcements yet.</p>}
            {announcements.slice(0, 5).map((a) => (
              <div key={a._id} className="rounded-lg border border-gray-100 p-4">
                <p className="font-medium text-gray-800">{a.title}</p>
                <p className="mt-1 text-sm text-gray-500">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
