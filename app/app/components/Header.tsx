"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import HeaderLogo from "./header/HeaderLogo";
import HeaderNavigation from "./header/HeaderNavigation";
import HeaderButton from "./header/HeaderButton";
import MobileMenuButton from "./header/MobileMenuButton";
import MobileMenu from "./header/MobileMenu";
import LoadingCard from "./ui/LoadingCard";

export default function Header({
  props,
}: {
  props: { status: string; session: any };
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <HeaderLogo />

          <HeaderNavigation />

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "loading" ? (
              <LoadingCard />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                  />
                )}
              </div>
            ) : (
              <HeaderButton href="/api/auth/signin">
                <img src="/github.png" alt="GitHub" className="w-5 h-5" />
                Sign up
              </HeaderButton>
            )}
          </div>

          <MobileMenuButton
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>

        <MobileMenu isMenuOpen={isMenuOpen} />
      </div>
    </header>
  );
}
