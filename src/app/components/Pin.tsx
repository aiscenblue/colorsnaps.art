import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PROXY_URL } from '@/lib/utils';
import { Icon } from './Icon';
import { ICONS } from '@/lib/utils';

import { Pin as PinType } from '@/lib/redux';

export const Pin = React.memo(function Pin({ pin, onRemovePin }: { pin: PinType, onRemovePin?: (pinId: string) => void }) {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Add isLoading state
    const router = useRouter();

    const handleClick = () => {
        router.push(`/details/${pin.id}`);
    };

    return (
        <div className="break-inside-avoid mb-4 group">
            <div className="relative rounded-lg bg-white border-2 border-primary transition-all hover:border-4 cursor-pointer">
              {imageError ? (
                <div className="w-full h-48 flex items-center justify-center bg-secondary rounded-t-md" onClick={handleClick}>
                  <Icon path={ICONS.warning} className="w-12 h-12 text-background" />
                </div>
              ) : (
                <>
                  {isLoading && ( // Show placeholder while loading
                    <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-t-md animate-pulse">
                      <Icon path={ICONS.link} className="w-12 h-12 text-background" /> {/* Placeholder icon */}
                    </div>
                  )}
                  <Image
                    src={`${PROXY_URL}${encodeURIComponent(pin.imgUrl)}`}
                    alt={pin.title}
                    layout="fill"
                    objectFit="cover"
                    className={`rounded-t-md transform transition-transform duration-200 hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`} // Hide image while loading
                    onError={() => setImageError(true)}
                    onLoad={() => setIsLoading(false)} // Set isLoading to false on load
                    onClick={handleClick}
                  />
                </>
              )}
              <div className="p-3 bg-white rounded-b-md"><h3 className="font-bold text-primary">{pin.title}</h3><p className="text-sm text-secondary mt-1">{pin.description}</p></div>
            </div>
          {onRemovePin && <button onClick={(e) => {e.stopPropagation(); onRemovePin(pin.id);}} className="absolute top-2 right-2 p-2 bg-accent/70 text-background rounded-full opacity-0 group-hover:opacity-100"><Icon path={ICONS.remove} className="w-5 h-5"/></button>}
        </div>
    );
});
