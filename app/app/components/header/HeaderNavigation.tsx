import { usePathname } from "next/navigation";

interface HeaderNavigationProps {
  isMobile?: boolean;
  isAuthPage?: boolean;
}

export default function HeaderNavigation({
  isMobile = false,
  isAuthPage = false,
}: HeaderNavigationProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const baseClasses =
    "text-gray-300 hover:text-white transition-colors cursor-pointer";
  const mobileClasses = isMobile ? "block px-3 py-2" : "";
  const desktopClasses = isMobile ? "" : "hidden md:flex space-x-8";

  if (isAuthPage || !isHomePage) return null;

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
