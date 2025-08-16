import React, { useState, useEffect } from "react";
import { Pin } from "@/lib/redux";
import { Pin as PinComponent } from "./Pin";

export const PinGrid = ({
  pins,
  onRemovePin,
}: {
  pins: Pin[];
  onRemovePin?: (pinId: string) => void;
}) => {
  const [numColumns, setNumColumns] = useState(5);
  useEffect(() => {
    const getCols = () =>
      window.innerWidth >= 1280
        ? 5
        : window.innerWidth >= 1024
          ? 4
          : window.innerWidth >= 768
            ? 3
            : 2;
    const handleResize = () => setNumColumns(getCols());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const columns: Pin[][] = Array.from({ length: numColumns }, () => []);
  pins.forEach((pin, i) => columns[i % numColumns].push(pin));
  return (
    <div className="flex flex-row items-start gap-6">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col w-full gap-6">
          {col.map((pin) => (
            <PinComponent key={pin.id} pin={pin} onRemovePin={onRemovePin} />
          ))}
        </div>
      ))}
    </div>
  );
};
