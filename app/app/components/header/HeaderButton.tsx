interface HeaderButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function HeaderButton({ href, children, className = '' }: HeaderButtonProps) {
  return (
    <a
      href={href}
      className={`bg-stone-950 text-white border-1 border-stone-700 px-6 py-2 rounded-lg hover:bg-stone-900 hover:border-stone-600 transition-all duration-200 font-medium flex items-center gap-2 ${className}`}
    >
      {children}
    </a>
  );
}
