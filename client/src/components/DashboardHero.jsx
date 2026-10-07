export default function DashboardHero({ eyebrow, title, subtitle }) {
  return (
    <div className="relative overflow-hidden rounded-xl text-white">
      <img src="/images/campus-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-900/80 to-primary-800/50" />
      <div className="relative px-6 py-8 sm:px-8">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">{eyebrow}</p>}
        <h1 className="mt-1 text-xl font-semibold sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
      </div>
    </div>
  );
}
