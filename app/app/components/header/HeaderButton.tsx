interface HeaderButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function HeaderButton({
  href,
  children,
  className = "",
}: HeaderButtonProps) {
  return (
    <a
      href={href}
      className={`bg-white text-black border-2 border-black px-6 py-2 rounded-lg hover:bg-gray-100 hover:border-gray-400 hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2 ${className}`}
    >
      {children}
    </a>
  );
}
