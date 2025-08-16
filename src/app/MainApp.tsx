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
import { PinDetailPage } from "@/app/components/PinDetailPage";
import { AuthPage } from "@/app/AuthPage";
import { PinNotFound } from "@/app/components/PinNotFound";
import DataService from "@/lib/data-service";

export const MainApp = ({
  user,
  onLogout,
  onLoginSuccess,
}: {
  user: User | null;
  onLogout: () => void;
  onLoginSuccess: (user: User) => void;
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const allPins = useSelector(selectDecryptedPins);
  const [page, setPage] = useState(1);
  const INITIAL_PINS_COUNT = 50;
  const pinsPerPage = 10;
  const [displayedPins, setDisplayedPins] = useState<Pin[]>(allPins);
  const [hasMore, setHasMore] = useState(true);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Effect to load initial pins and handle infinite scrolling
  useEffect(() => {
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
          creatorId: "random",
          title: `Random Image ${id}`,
          description: "A random image from Lorem Picsum.",
          camera: "",
          location: "",
        });
      }
      return newRandomPins;
    };

    if (allPins.length === 0) {
      const initialRandomPins = generateRandomPins(INITIAL_PINS_COUNT);
      dispatch(pinsSlice.actions.setRandomPins(initialRandomPins));
      setDisplayedPins(initialRandomPins);
    }

    if (page > 1) {
      // Subsequent loads
      const newRandomPins = generateRandomPins(pinsPerPage);
      dispatch(pinsSlice.actions.addRandomPins(newRandomPins));
      setDisplayedPins((prevPins) => [...prevPins, ...newRandomPins]); // Append to displayedPins
    } else if (page === 1 && displayedPins.length < INITIAL_PINS_COUNT) {
      const initialRandomPins = generateRandomPins(
        INITIAL_PINS_COUNT - displayedPins.length,
      );
      dispatch(pinsSlice.actions.setRandomPins(initialRandomPins));
      setDisplayedPins((prevPins) => [...prevPins, ...initialRandomPins]);
    }
    setHasMore(true); // Always allow loading more random pins
  }, [page, pinsPerPage, dispatch, displayedPins.length, allPins.length]);

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

  const addPin = (imgUrl: string) => {
    const newPin: Pin = {
      id: Date.now().toString(),
      imgUrl,
      creatorId: user ? user.id : "guest",
      title: "Untitled Pin",
      description: "",
      camera: "",
      location: "",
    }; // Set creatorId to 'guest' if not logged in
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
    if (allPins.find((p) => p.id === pinId)?.creatorId === user.id)
      dispatch(pinsSlice.actions.removePin(pinId));
    dispatch(pinsSlice.actions.removeSavedPinId(pinId));
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
    if (isDetailsPage && pinIdFromUrl) {
      let selectedPin = [...allPins, ...allRandomPins].find(
        (p) => p.id === pinIdFromUrl,
      );
      const isSaved = savedIds.includes(pinIdFromUrl);

      if (!selectedPin) {
        const pinFromDataService = DataService.getPinById(pinIdFromUrl);
        if (pinFromDataService) {
          selectedPin = pinFromDataService;
        } else {
          const newPin: Pin = {
            id: pinIdFromUrl,
            imgUrl: `https://picsum.photos/seed/${pinIdFromUrl}/400/600`,
            creatorId: "random",
            title: `Random Image ${pinIdFromUrl}`,
            description: "A random image from Lorem Picsum.",
            camera: "",
            location: "",
          };
          dispatch(pinsSlice.actions.addPin(newPin));
          selectedPin = newPin;
        }
      }

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
          scriptsLoaded={scriptsLoaded}
          currentUser={user}
          allAvailablePins={allAvailablePins}
          onLoginRedirect={handleLoginRedirect}
        />
      );
    }

    switch (view) {
      case "discover":
        return (
          <>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPin()}
                placeholder="Paste an image URL to create a new snap..."
                className="w-full p-3 border-2 border-primary rounded-full bg-white"
              />
              <button
                onClick={handleAddPin}
                className="bg-accent text-background font-semibold px-6 py-3 rounded-full"
              >
                Snap
              </button>
            </div>
            <PinGrid pins={displayedPins} onRemovePin={undefined} />
          </>
        );
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
            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={() => setPage((prevPage) => prevPage + 1)}
                  className="bg-accent text-background font-bold py-2 px-4 rounded-full"
                >
                  Load More
                </button>
              </div>
            )}
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
      <main className="px-4 py-6 sm:px-6 lg:px-8">{renderView()}</main>
    </div>
  );
};

