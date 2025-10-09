'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import HeaderLogo from './header/HeaderLogo';
import HeaderButton from './header/HeaderButton';
import MobileMenuButton from './header/MobileMenuButton';
import MobileMenu from './header/MobileMenu';

export default function Header({ props }: { props: { status: string; session: any } }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';

  // Handle background image loading and fade-in
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      // Wait for image to render, then start fade-in
      setTimeout(() => {
        setIsBackgroundLoaded(true);
      }, 100);
    };
    img.src = '/background.png';
  }, []);

  return (
    <header className="bg-black sticky top-0 z-50">
      <div className="mx-2 mt-2">
        <div className="bg-stone-950 rounded-lg shadow-lg border border-stone-700 relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div
              className={`w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-[5000ms] ease-in-out ${
                isBackgroundLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('/background.png')`,
                filter: 'brightness(0.2)',
                transform: 'scale(1.1)',
              }}
            />
          </div>

          <div className="px-8 relative z-10">
            <div className="flex justify-between items-center h-14">
              <HeaderLogo />
              <div className="hidden md:flex items-center space-x-4">
                {session ? (
                  <div className="flex items-center space-x-3">
                    {session.user?.image && (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-1 border-stone-700"
                      />
                    )}
                    {!session.user?.image && (
                      <div className="w-10 h-10 rounded-full border-1 border-stone-700 bg-stone-600 flex items-center justify-center text-xs text-white">
                        {session.user?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                ) : (
                  !isAuthPage && (
                    <HeaderButton href="/auth">
                      <img src="/google.png" alt="GitHub" className="w-5 h-5" />
                      Sign up
                    </HeaderButton>
                  )
                )}
              </div>

              <MobileMenuButton isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            </div>

            <MobileMenu isMenuOpen={isMenuOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}
