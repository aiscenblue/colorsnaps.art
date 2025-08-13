import React from 'react';
import { Icon } from './Icon'; // Assuming Icon component is in the same directory
import { ICONS } from '@/lib/utils'; // Import ICONS from utils

export const PinNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-secondary">
      <Icon path={ICONS.warning} className="w-24 h-24 mb-4 animate-bounce" />
      <h2 className="text-3xl font-bold mb-2">Pin Not Found</h2>
      <p className="text-lg text-center">
        Oops! It seems like the pin you're looking for doesn't exist or has been removed.
      </p>
      <p className="text-md text-center mt-2">
        Please check the URL or go back to the Discover page.
      </p>
    </div>
  );
};