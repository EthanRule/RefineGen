"use client";

import { useSession, signOut } from "next-auth/react";
import HeaderNavigation from "./HeaderNavigation";
import HeaderButton from "./HeaderButton";
import LoadingCard from "../ui/LoadingCard";

interface MobileMenuProps {
  isMenuOpen: boolean;
}

export default function MobileMenu({ isMenuOpen }: MobileMenuProps) {
  const { data: session, status } = useSession();

  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
        <HeaderNavigation isMobile={true} />

        {status === "loading" ? (
          <div className="px-3 py-2">
            <LoadingCard />
          </div>
        ) : session ? (
          <div className="px-3 py-2 text-gray-700 border-b border-gray-200 flex items-center space-x-3">
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
          <HeaderButton
            href="/api/auth/signin"
            className="block w-full text-left"
          >
            <img src="/github.png" alt="GitHub" className="w-5 h-5" />
            Sign up
          </HeaderButton>
        )}
      </div>
    </div>
  );
}
