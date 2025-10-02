"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import HeaderNavigation from "./HeaderNavigation";
import HeaderButton from "./HeaderButton";
import LoadingCard from "../ui/LoadingCard";

interface MobileMenuProps {
  isMenuOpen: boolean;
}

export default function MobileMenu({ isMenuOpen }: MobileMenuProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 border-t border-gray-800">
        <HeaderNavigation isMobile={true} isAuthPage={isAuthPage} />

        {session ? (
          <div className="px-3 py-2 text-gray-300 border-b border-gray-800 flex items-center space-x-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-6 h-6 rounded-full border border-gray-300"
              />
            )}
            <span>{session.user?.name || session.user?.email}</span>
          </div>
        ) : (
          !isAuthPage && (
            <HeaderButton href="/auth" className="block w-full text-left">
              <img src="/github.png" alt="GitHub" className="w-5 h-5" />
              Sign up
            </HeaderButton>
          )
        )}
      </div>
    </div>
  );
}
