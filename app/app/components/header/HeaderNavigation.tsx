interface HeaderNavigationProps {
  isMobile?: boolean;
}

export default function HeaderNavigation({
  isMobile = false,
}: HeaderNavigationProps) {
  const baseClasses =
    "text-gray-600 hover:text-gray-900 transition-colors cursor-pointer";
  const mobileClasses = isMobile ? "block px-3 py-2" : "";
  const desktopClasses = isMobile ? "" : "hidden md:flex space-x-8";

  return (
    <nav className={desktopClasses}>
      <a href="#features" className={`${baseClasses} ${mobileClasses}`}>
        Features
      </a>
      <a href="#how-it-works" className={`${baseClasses} ${mobileClasses}`}>
        How it Works
      </a>
      <a href="#pricing" className={`${baseClasses} ${mobileClasses}`}>
        Pricing
      </a>
    </nav>
  );
}
