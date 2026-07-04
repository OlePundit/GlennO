const links = [
  { label: 'Twitter', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'LinkedIn', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-24">
      <div className="max-w-2xl mx-auto px-6 py-10 text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} DevBlog</p>
        <div className="flex items-center gap-4">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-green-400 transition-colors">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
