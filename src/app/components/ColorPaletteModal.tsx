'use client';

import React from 'react';
import { IoClose } from 'react-icons/io5';

interface ColorPaletteModalProps {
  palettes: { hex: string; rgb: { r: number; g: number; b: number } }[];
  onClose: () => void;
}

const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({ palettes, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
          aria-label="Close"
        >
          <IoClose />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">All Color Palettes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {palettes.map((palette, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div
                  className="w-full h-24"
                  style={{ backgroundColor: palette.hex }}
                ></div>
                <div className="p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Hex: <span className="font-normal text-gray-900">{palette.hex}</span></p>
                  <p className="text-sm font-semibold text-gray-700">RGB: <span className="font-normal text-gray-900">{`rgb(${palette.rgb.r}, ${palette.rgb.g}, ${palette.rgb.b})`}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteModal;