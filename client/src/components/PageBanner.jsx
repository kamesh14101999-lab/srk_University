export default function PageBanner({ title, subtitle }) {
  return (
    <div className="relative overflow-hidden py-16 text-center text-white sm:py-20">
      <img src="/images/campus-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/85 via-primary-900/75 to-primary-900/90" />
      <div className="relative mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-white/75">{subtitle}</p>}
      </div>
    </div>
  );
}
