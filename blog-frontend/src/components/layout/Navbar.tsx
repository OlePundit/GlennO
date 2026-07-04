'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/blog', label: 'Blog' },
    { href: '/authors', label: 'Authors' },
  ];

  return (
    <header className="border-b border-gray-800">
      <nav className="max-w-2xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-medium text-white hover:text-green-400 transition-colors">
            DevBlog
          </Link>

          <div className="hidden sm:flex items-center gap-6 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            className="sm:hidden p-1 text-gray-400"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="sm:hidden flex flex-col gap-3 pb-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-green-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
