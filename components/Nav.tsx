import Link from 'next/link';

const navItems = [
  { label: 'Goals', href: '/goals' },
  { label: 'Tasks', href: '/tasks' }
];

export default function Nav() {
  return (
    <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm shadow-slate-200/60">
      <div className="text-lg font-semibold tracking-tight text-slate-900">Dashboard</div>
      <div className="flex gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
