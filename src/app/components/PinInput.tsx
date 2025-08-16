import React from 'react';

interface PinInputProps {
  url: string;
  setUrl: (url: string) => void;
  handleAddPin: () => void;
}

const PinInput: React.FC<PinInputProps> = ({ url, setUrl, handleAddPin }) => {
  return (
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
  );
};

export default PinInput;