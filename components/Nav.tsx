'use client';

import Link from 'next/link';
import { useState } from 'react';

const navItems = [
  { label: 'Goals', href: '/goals' },
  { label: 'Tasks', href: '/tasks' }
];

const linkClasses =
  'rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm shadow-slate-200/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold tracking-tight text-slate-900">Dashboard</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">Goals &amp; tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden gap-3 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={linkClasses}>
                {item.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 md:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="h-0.5 w-5 bg-current" />
              <span className="h-0.5 w-5 bg-current" />
            </div>
          </button>
        </div>
      </div>
      <div className={`flex flex-col gap-3 md:hidden ${isOpen ? 'flex' : 'hidden'}`}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClasses} onClick={handleNavClick}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
