import HeaderNavigation from "./HeaderNavigation";
import HeaderButton from "./HeaderButton";

interface MobileMenuProps {
  isMenuOpen: boolean;
}

export default function MobileMenu({ isMenuOpen }: MobileMenuProps) {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
        <HeaderNavigation isMobile={true} />
        <HeaderButton
          href="/api/auth/signin"
          className="block w-full text-left"
        >
          <img src="/github.png" alt="GitHub" className="w-5 h-5" />
          Sign up
        </HeaderButton>
      </div>
    </div>
  );
}
