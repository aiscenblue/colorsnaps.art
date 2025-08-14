import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDecryptedPins, uiSlice, pinsSlice, RootState, User, Pin } from '@/lib/redux';
import { PinGrid } from '@/app/components/PinGrid';
import { MyPinsPage } from '@/app/components/MyPinsPage';
import { Header } from '@/app/components/Header';
import { useRouter, usePathname } from 'next/navigation';
import { PinDetailPage } from '@/app/components/PinDetailPage';
import { AuthPage } from '@/app/AuthPage';
import { PinNotFound } from '@/app/components/PinNotFound';

export const MainApp = ({ user, onLogout, onLoginSuccess }: { user: User | null, onLogout: () => void, onLoginSuccess: (user: User) => void }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const allPins = useSelector(selectDecryptedPins);
  const [isClient, setIsClient] = React.useState(false);
  const [page, setPage] = useState(1);
  const pinsPerPage = 20;
  const [displayedPins, setDisplayedPins] = useState<Pin[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  

  // Effect to load initial pins and handle infinite scrolling
  useEffect(() => {
    if (!isClient) return; // Only run on client

    const generateRandomPins = (count: number) => {
      const newRandomPins: Pin[] = [];
      for (let i = 0; i < count; i++) {
        const id = `random-${Date.now()}-${Math.floor(Math.random() * 100000)}`; // Ensure unique ID
        const width = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
        const height = Math.floor(Math.random() * (700 - 400 + 1)) + 400;
        const imgUrl = `https://picsum.photos/${width}/${height}?random=${id}`;
        newRandomPins.push({
          id,
          imgUrl,
          creatorId: 'random',
          title: `Random Image ${id}`,
          description: 'A random image from Lorem Picsum.',
          camera: '',
          location: ''
        });
      }
      return newRandomPins;
    };

    const newRandomPins = generateRandomPins(pinsPerPage);
    if (page === 1) { // Initial load
      dispatch(pinsSlice.actions.setRandomPins(newRandomPins));
      setDisplayedPins([...allPins, ...newRandomPins]); // Update displayedPins immediately
    } else { // Subsequent loads
      dispatch(pinsSlice.actions.addRandomPins(newRandomPins));
      setDisplayedPins(prevPins => [...prevPins, ...newRandomPins]); // Append to displayedPins
    }
    setHasMore(true); // Always allow loading more random pins

  }, [page, allPins, pinsPerPage, isClient, dispatch]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!isClient || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      const currentLoader = loader.current; // Capture the ref value
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isClient]);

  const allRandomPins = useSelector((state: RootState) => state.pins.randomPins);
  const { savedIds } = useSelector((state: RootState) => state.pins);
  const savedPinIds = new Set(savedIds);

  // Combine allPins and allRandomPins
  const allAvailablePins = [...allPins, ...allRandomPins];

  // Determine active view based on pathname
  const currentPath = usePathname();
  const view = currentPath === '/' || currentPath === '/discover' ? 'discover' :
               currentPath === '/my-pins' ? 'myPins' :
               currentPath.startsWith('/details/') ? 'details' : 'discover'; // Default to discover

  useEffect(() => {
    const loadScript = (src: string, id: string, onLoad: () => void) => {
        if (document.getElementById(id)) { onLoad(); return; }
        const script = document.createElement('script');
        Object.assign(script, { src, id, async: true, defer: true, onload: onLoad });
        document.body.appendChild(script);
    };
    let loadedCount = 0;
    const checkAllLoaded = () => { if (++loadedCount === 3) {}; };
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    loadScript('https://cdn.jsdelivr.net/npm/exif-js','exif-s',checkAllLoaded);
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.4.0/color-thief.min.js','ct-s',checkAllLoaded);
    if (API_KEY) loadScript(`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`,'gm-s',checkAllLoaded);
    else { console.warn("Google Maps API key missing."); checkAllLoaded(); }
  }, []);
  
  
  
  const handleLoginRedirect = (path: string) => {
    localStorage.setItem('redirectPath', path);
    router.push('/'); // Redirect to root, which will show AuthPage if not logged in
  };

  const addPin = (imgUrl: string) => {
    const newPin: Pin = { id: Date.now().toString(), imgUrl, creatorId: user ? user.id : 'guest', title: 'Untitled Pin', description: '', camera: '', location: '' }; // Set creatorId to 'guest' if not logged in
    dispatch(pinsSlice.actions.addPin(newPin));
    router.push(`/details/${newPin.id}`); // Redirect to the details page of the new pin
  };

  const removePin = (pinId: string) => {
    if (!user) {
      // If user is not logged in, they cannot remove pins they created.
      // However, they can still remove saved pins.
      dispatch(pinsSlice.actions.removeSavedPinId(pinId));
      return;
    }
    if (allPins.find(p => p.id === pinId)?.creatorId === user.id) dispatch(pinsSlice.actions.removePin(pinId));
    dispatch(pinsSlice.actions.removeSavedPinId(pinId));
  };

  const [url, setUrl] = React.useState('');
  const handleAddPin = () => {
    if (url.trim()) {
      addPin(url.trim());
      setUrl('');
    }
  };

  const pathname = usePathname();
  const isDetailsPage = pathname.startsWith('/details/');
  const pinIdFromUrl = isDetailsPage ? pathname.split('/').pop() : undefined;

  const renderView = () => {
    if (isDetailsPage && pinIdFromUrl) {
      const selectedPin = [...allPins, ...allRandomPins].find(p => p.id === pinIdFromUrl);
      const isSaved = savedIds.includes(pinIdFromUrl);

      const handleUpdatePin = (updatedPin: Pin) => {
        dispatch(pinsSlice.actions.updatePin(updatedPin));
      };

      const handleSavePin = (pinId: string) => {
        dispatch(pinsSlice.actions.addSavedPinId(pinId));
      };

      const handleRemovePin = (pinId: string) => {
        dispatch(pinsSlice.actions.removePin(pinId));
        dispatch(pinsSlice.actions.removeSavedPinId(pinId));
      };

      if (!selectedPin) {
        return <PinNotFound />;
      }

      return (
        <PinDetailPage
          pin={selectedPin}
          onBack={() => router.back()}
          onUpdatePin={handleUpdatePin}
          onSavePin={handleSavePin}
          onRemovePin={handleRemovePin}
          isSaved={isSaved}
          scriptsLoaded={true}
          currentUser={user}
          allAvailablePins={allAvailablePins}
          onLoginRedirect={handleLoginRedirect}
        />
      );
    }

    switch(view) {
        case 'discover': return (
          <>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPin()}
                placeholder="Paste an image URL to create a new snap..."
                className="w-full p-3 border-2 border-primary rounded-full bg-white"
              />
              <button onClick={handleAddPin} className="bg-accent text-background font-semibold px-6 py-3 rounded-full">Snap</button>
            </div>
            <PinGrid pins={displayedPins} onRemovePin={undefined} />
          </>
        );
                case 'myPins': return user ? <MyPinsPage allPins={allPins} savedPinIds={new Set(savedIds)} onRemovePin={removePin} currentUserId={user.id} /> : <AuthPage onLoginSuccess={onLoginSuccess} />;
        default: return (
          <>
            <PinGrid pins={displayedPins} onRemovePin={undefined} />
            {hasMore && (
              <div ref={loader} className="text-center py-4">
                <p className="text-foreground">Loading more pins...</p>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans text-foreground">
      <Header onAddPin={addPin} activeView={view} onViewChange={(v: string) => {
        if (v === 'discover') router.push('/');
        else if (v === 'myPins') router.push('/my-pins');
      }} onLogout={onLogout} isLoggedIn={!!user} />
      <main className="px-4 py-6 sm:px-6 lg:px-8">{renderView()}</main>
    </div>
  );
};