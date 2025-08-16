"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { rgbToHex, ICONS } from "@/lib/utils";
import { Icon } from "./Icon";
import { useRouter, usePathname } from "next/navigation";

import { Pin, User } from "@/lib/redux";

declare global {
  interface Window {
    ColorThief: new () => {
      getPalette: (img: HTMLImageElement, count: number) => number[][];
    };
    EXIF: {
      getData: (
        img: HTMLImageElement,
        callback: (this: HTMLImageElement) => void,
      ) => void;
      getAllTags: (img: HTMLImageElement) => Record<string, string>;
    };
  }
}

export const PinDetailPage = ({
  pin,
  onBack,
  onUpdatePin,
  onSavePin,
  onRemovePin,
  isSaved,
  scriptsLoaded,
  currentUser,
  allAvailablePins,
  onLoginRedirect,
}: {
  pin: Pin;
  onBack: () => void;
  onUpdatePin: (pin: Pin) => void;
  onSavePin: (pinId: string) => void;
  onRemovePin: (pinId: string) => void;
  isSaved: boolean;
  scriptsLoaded: boolean;
  currentUser: User | null;
  allAvailablePins: Pin[];
  onLoginRedirect: (path: string) => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const [palette, setPalette] = useState<number[][] | null>(null);
  const [exifData, setExifData] = useState<Record<string, string> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editablePin, setEditablePin] = useState(pin);

  const getImageDimensions = (url: string) => {
    const regex = /picsum\.photos\/(\d+)\/(\d+)/;
    const match = url.match(regex);
    if (match && match.length >= 3) {
      return { width: parseInt(match[1]), height: parseInt(match[2]) };
    }
    // Default dimensions if parsing fails or for non-Lorem Picsum images
    return { width: 400, height: 600 };
  };

  const { width, height } = getImageDimensions(pin.image.url);

  useEffect(() => {
    if (!scriptsLoaded || !pin) return;
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = pin.image.url;
    const colorThief = new window.ColorThief();
    img.onload = () => {
      try {
        setPalette(colorThief.getPalette(img, 15));
      } catch (e) {
        console.error(e);
      }
      if (window.EXIF)
        window.EXIF.getData(img, function () {
          setExifData(window.EXIF.getAllTags(this));
        });
    };
  }, [pin, scriptsLoaded]);

  const handleSave = () => {
    onUpdatePin(editablePin);
    setIsEditing(false);
  };

  const handleNextPin = () => {
    const currentIndex = allAvailablePins.findIndex((p) => p.id === pin.id);
    if (currentIndex !== -1) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < allAvailablePins.length) {
        const nextPin = allAvailablePins[nextIndex];
        router.push(`/details/${nextPin.id}`);
      }
    }
  };

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-semibold text-secondary hover:text-primary"
        >
          <Icon path={ICONS.back} /> Back
        </button>
        {allAvailablePins.length > 1 && (
          <button
            onClick={handleNextPin}
            className="flex items-center gap-2 font-semibold text-secondary hover:text-primary"
          >
            Next <Icon path={ICONS.next} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {" "}
          {/* Visuals */}
          {imageError ? (
            <div className="w-full h-64 flex items-center justify-center bg-secondary rounded-lg">
              <Icon
                path={ICONS.warning}
                className="w-24 h-24 text-background"
              />
            </div>
          ) : (
            <>{
              isLoading && ( // Show placeholder while loading
                <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-lg animate-pulse">
                  <Icon
                    path={ICONS.link}
                    className="w-24 h-24 text-background"
                  />{" "}
                  {/* Placeholder icon */}
                </div>
              )}
              <Image
                src={pin.image.url}
                alt={pin.title}
                layout="intrinsic"
                width={width}
                height={height}
                className={`rounded-lg border-2 border-primary w-full h-auto ${isLoading ? "opacity-0" : "opacity-100"}`} // Hide image while loading
                onError={() => setImageError(true)}
                onLoad={() => setIsLoading(false)} // Set isLoading to false on load
              />
            </>
          )}
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-3 text-primary flex items-center gap-2">
              <Icon path={ICONS.link} className="w-5 h-5" />
              Image Link
            </h3>
            <a
              href={pin.image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline break-all"
            >{pin.image.url}</a>
          </div>
          {!isEditing && pin.about && (
            <p className="text-foreground mt-2 text-lg">{pin.about}</p>
          )}
          {palette && (
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-3 text-primary">Palette</h3>
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {palette.slice(0, 5).map((c, i) => {
                  const hex = rgbToHex(c[0], c[1], c[2]);
                  const lum =
                    (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
                  return (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-16 h-16 rounded-full border-2 border-gray-300 ${lum > 0.5 ? "text-primary" : "text-background"}`}
                      style={{ backgroundColor: hex }}
                    ></div>
                  );
                })}
              </div>
            </div>
          )}
          {exifData && Object.entries(exifData).length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-3 text-primary">Metadata</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-primary">
                {Object.entries(exifData).filter(([key]) => key !== 'UserComment' && key !== 'thumbnail').map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong>{" "}
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value)}
                  </p>
                ))}
              </div>
            </div>
          )}
          {!isEditing && pin.postedBy.userName && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-3 text-primary">Posted By</h3>
              <p className="mt-1 text-primary">{pin.postedBy.userName}</p>
            </div>
          )}
        </div>
        <div>
          {" "}
          {/* Data */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">
              {isEditing ? "Editing Pin" : pin.title}
            </h2>
            {pin.postedBy._id === currentUser?.id ? (
              !isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-accent text-background font-semibold px-4 py-2 rounded-md border-2 border-primary hover:bg-accent-dark"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-accent text-background font-semibold px-4 py-2 rounded-md"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-accent text-background font-semibold px-4 py-2 rounded-md border-2 border-primary"
                  >
                    Cancel
                  </button>
                </div>
              )
            ) : isSaved ? (
              <button
                onClick={() => onRemovePin(pin.id)}
                className="bg-red-600 text-background px-4 py-2 rounded-md border-2 border-red-600"
              >
                <Icon path={ICONS.remove} />
                Unsave
              </button>
            ) : (
              <button
                onClick={() => {
                  if (currentUser) {
                    onSavePin(pin.id);
                  }
                  else {
                    onLoginRedirect(pathname);
                  }
                }}
                className="bg-accent text-background px-4 py-2 rounded-md border-2 border-primary"
              >
                <Icon path={ICONS.save} />
                Save
              </button>
            )}
          </div>
          {Object.entries({
            title: "Title",
            about: "Description",
          }).map(([key, label]) => (
            <div key={key} className="flex items-start gap-4 mb-4">
              <Icon
                path={ICONS[key as keyof typeof ICONS]}
                className="w-6 h-6 text-secondary mt-2"
              />
              <div className="flex-grow">
                <label className="text-sm font-bold text-secondary">
                  {label}
                </label>
                {isEditing ? (
                    <input
                      type="text"
                      value={String(editablePin[key as keyof Pin]) || ""}
                      onChange={(e) =>
                        setEditablePin({
                          ...editablePin,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full p-2 border-2 border-secondary rounded-md mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  
                ) : (
                  <p className="mt-1 text-primary">
                    {String(pin[key as keyof Pin]) || (
                      <span className="text-secondary">Not specified</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
