import React from 'react';
import { Icon } from './Icon';
import { ICONS } from '@/lib/utils';

export const Header = ({ activeView, onViewChange, onLogout, isLoggedIn }: { activeView: string, onViewChange: (view: string) => void, onLogout: () => void, isLoggedIn: boolean }) => {
  return (
    <header className="p-4 bg-background/80 backdrop-blur-lg border-b-2 border-primary sticky top-0 z-20">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-primary font-serif">Color Snaps</h1>
        <nav className="flex gap-2 flex-grow">
          <button onClick={() => onViewChange('discover')} className={`px-4 py-2 rounded-md font-semibold ${activeView === 'discover' ? 'bg-accent text-background' : 'text-primary'}`}>Discover</button>
          <button onClick={() => onViewChange('myPins')} className={`px-4 py-2 rounded-md font-semibold ${activeView === 'myPins' ? 'bg-accent text-background' : 'text-primary'}`}>My Pins</button>
        </nav>
        {isLoggedIn && <button onClick={onLogout} className="flex items-center gap-2 font-semibold p-2 rounded-md hover:bg-accent"><Icon path={ICONS.logout} /> Logout</button>}
      </div>
    </header>
  );
};
