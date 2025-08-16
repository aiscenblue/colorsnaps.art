import React, { useRef, useEffect } from 'react';

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: google.maps.places.AutocompleteOptions) => google.maps.places.Autocomplete;
        };
        Geocoder: new () => google.maps.Geocoder;
      };
    };
  }
}



export const LocationAutocomplete = React.memo(function LocationAutocomplete({ value, onChange, disabled }: { value: string, onChange: (value: string) => void, disabled: boolean }) {
    const inputRef = useRef(null);
    useEffect(() => {
        if (disabled || !window.google || !inputRef.current) return;
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { types: ["geocode"] });
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place?.formatted_address) onChange(place.formatted_address);
        });
    }, [disabled, onChange]);
    return <input ref={inputRef} type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 border-2 border-secondary rounded-md mt-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary" disabled={disabled} placeholder="Start typing..." />;
});
