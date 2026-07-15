'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/orders', label: 'Orders' },
  { href: '/simulate', label: 'Simulate NR' },
  { href: '/synthetics', label: 'Synthetics Guide' },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-gray-800 bg-gray-900 px-4">
      <div className="container mx-auto max-w-6xl flex items-center gap-1 h-14">
        <span className="mr-4 font-bold text-[#00AC69] text-lg tracking-tight">
          NR Demo
        </span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              pathname === l.href
                ? 'bg-[#00AC69]/20 text-[#00AC69]'
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
