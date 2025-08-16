import React from 'react';
import { Icon } from './Icon';
import { ICONS } from '@/lib/utils';

import { useRouter, usePathname } from 'next/navigation';

export const Header = ({ activeView, onViewChange, onLogout, isLoggedIn, router }: { activeView: string, onViewChange: (view: string) => void, onLogout: () => void, isLoggedIn: boolean, router: ReturnType<typeof useRouter> }) => {
  const pathname = usePathname();
  return (
    <header className="p-4 bg-background/80 backdrop-blur-lg border-b-2 border-primary sticky top-0 z-20">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-primary font-serif">Color Snaps</h1>
        <nav className="flex gap-2 flex-grow">
          <button onClick={() => onViewChange('discover')} className={`px-4 py-2 rounded-md font-semibold bg-transparent border-2 ${activeView === 'discover' ? 'border-white text-white' : 'border-white text-white'}`}>Discover</button>
          {isLoggedIn && (
            <button onClick={() => onViewChange('myPins')} className={`px-4 py-2 rounded-md font-semibold ${pathname === '/pins/me' ? 'bg-accent text-background' : 'text-primary'}`}>My Pins</button>
          )}
        </nav>
        {!isLoggedIn && pathname !== '/login' && (
          <button onClick={() => router.push('/login')} className="px-4 py-2 rounded-md font-semibold bg-transparent border-2 border-white text-white">Login</button>
        )}
        {isLoggedIn && <button onClick={onLogout} className="flex items-center gap-2 font-semibold p-2 rounded-md hover:bg-accent"><Icon path={ICONS.logout} /> Logout</button>}
      </div>
    </header>
  );
};
