import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDecryptedPins,
  pinsSlice,
  RootState,
  User,
  Pin,
} from "@/lib/redux";
import { PinGrid } from "@/app/components/PinGrid";
import { MyPinsPage } from "@/app/components/MyPinsPage";
import { Header } from "@/app/components/Header";
import { useRouter, usePathname } from "next/navigation";
import { AuthPage } from "@/app/AuthPage";
import dynamic from 'next/dynamic';

const ColorPaletteLoader = dynamic(() => import('./components/ColorPaletteLoader'), { ssr: false });
const DynamicPinInput = dynamic(() => import('./components/PinInput'), { ssr: false });
import { PinDetails } from './components/PinDetails';

const DiscoverPage = dynamic(() => import('@/app/discover/page'), { ssr: false });

export const MainApp = ({
  user,
  onLogout,
  onLoginSuccess,
}: {
  user: User | null;
  onLogout: () => void;
  onLoginSuccess: (token: string) => void;
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const allPins = useSelector(selectDecryptedPins);
  const [displayedPins, setDisplayedPins] = useState<Pin[]>(allPins);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/pins');
        const pins = await response.json();
        console.log("Fetched pins:", pins);
        dispatch(pinsSlice.actions.setPins(pins));
        if (user) {
          const token = localStorage.getItem('pins_token');
          if (token) {
              const response = await fetch('/api/saved-pins', {
                  headers: {
                      'Authorization': token
                  }
              });
              const savedIds = await response.json();
              dispatch(pinsSlice.actions.setSavedPinIds(savedIds));
          }
        }
        setDisplayedPins(pins); // Set all pins directly
      } catch (error) {
        console.error("Error fetching pins:", error);
      } finally {
        setIsLoading(false); // Ensure loader is always removed
      }
    };
    fetchData();
  }, [dispatch, user]);

  const allRandomPins = useSelector(
    (state: RootState) => state.pins.randomPins,
  );
  const { savedIds } = useSelector((state: RootState) => state.pins);

  // Combine allPins and allRandomPins
  const allAvailablePins = [...allPins, ...allRandomPins];

  // Determine active view based on pathname
  const currentPath = usePathname();
  const view =
    currentPath === "/" || currentPath === "/discover"
      ? "discover"
      : currentPath === "/my-pins"
        ? "myPins"
        : currentPath.startsWith("/details/")
          ? "details"
          : "discover"; // Default to discover

  useEffect(() => {
    const loadScript = (src: string, id: string, onLoad: () => void) => {
      if (document.getElementById(id)) {
        onLoad();
        return;
      }
      const script = document.createElement("script");
      Object.assign(script, {
        src,
        id,
        async: true,
        defer: true,
        onload: onLoad,
      });
      document.body.appendChild(script);
    };
    let loadedCount = 0;
    const checkAllLoaded = () => {
      if (++loadedCount === 3) setScriptsLoaded(true);
    };
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    loadScript(
      "https://cdn.jsdelivr.net/npm/exif-js",
      "exif-s",
      checkAllLoaded,
    );
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.4.0/color-thief.min.js",
      "ct-s",
      checkAllLoaded,
    );
    if (API_KEY)
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`,
        "gm-s",
        checkAllLoaded,
      );
    else {
      console.warn("Google Maps API key missing.");
      checkAllLoaded();
    }
  }, []);

  const handleLoginRedirect = (path: string) => {
    localStorage.setItem("redirectPath", path);
    router.push("/"); // Redirect to root, which will show AuthPage if not logged in
  };

  const addPin = async (imgUrl: string) => {
    const newPin: Pin = {
      id: Date.now().toString(),
      image: { url: imgUrl, alt: "User uploaded image", width: 0, height: 0 },
      destination: "",
      save: [],
      about: "",
      category: "User Uploaded",
      title: "Untitled Pin",
      postedBy: { _id: user ? user.id : "guest", userName: user ? user.username : "Guest", image: "" },
    };
    dispatch(pinsSlice.actions.addPin(newPin));
    await fetch('/api/pins', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify([newPin])
    });
    router.push(`/details/${newPin.id}`);
  };

  const removePin = async (pinId: string) => {
    const newSavedIds = new Set(savedIds.filter(id => id !== pinId));
    if (user && allPins.find((p) => p.id === pinId)?.postedBy._id === user.id) {
      dispatch(pinsSlice.actions.removePin(pinId));
      await fetch(`/api/pins/${pinId}`, { method: 'DELETE' });
    }
    dispatch(pinsSlice.actions.setSavedPinIds(Array.from(newSavedIds)));
    if(user) {
        const token = localStorage.getItem('pins_token');
        if (token) {
            await fetch('/api/saved-pins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(Array.from(newSavedIds))
            });
        }
    }
  };

  const [url, setUrl] = React.useState("");
  const handleAddPin = () => {
    if (url.trim()) {
      addPin(url.trim());
      setUrl("");
    }
  };

  const pathname = usePathname();
  const isDetailsPage = pathname.startsWith("/details/");
  const pinIdFromUrl = isDetailsPage ? pathname.split("/").pop() : undefined;

  const renderView = () => {
    if (isLoading) {
      return <ColorPaletteLoader />;
    }

    if (isDetailsPage && pinIdFromUrl) {
      return <PinDetails pinId={pinIdFromUrl} user={user} allAvailablePins={allAvailablePins} onLoginRedirect={handleLoginRedirect} scriptsLoaded={scriptsLoaded} />;
    }

    switch (view) {
      case "discover":
        return <DiscoverPage />;
      case "myPins":
        return user ? (
          <MyPinsPage
            allPins={allPins}
            savedPinIds={new Set(savedIds)}
            onRemovePin={removePin}
            currentUserId={user.id}
          />
        ) : (
          <AuthPage onLoginSuccess={onLoginSuccess} />
        );
      default:
        return (
          <>
            <PinGrid pins={displayedPins} onRemovePin={undefined} />
          </>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans text-foreground">
      <Header
        activeView={view}
        onViewChange={(v: string) => {
          if (v === "discover") router.push("/");
          else if (v === "myPins") router.push("/my-pins");
        }}
        onLogout={onLogout}
        isLoggedIn={!!user}
      />
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Pin Input always visible */}
        <DynamicPinInput url={url} setUrl={setUrl} handleAddPin={handleAddPin} />
        {renderView()}
      </main>
    </div>
  );
};