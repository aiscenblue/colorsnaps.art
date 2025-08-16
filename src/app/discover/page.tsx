"use client";
import { useEffect, useState } from 'react';
import { clientApi } from '@/lib/client-api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Pin } from '@/lib/redux';
import ColorPaletteLoader from '@/app/components/ColorPaletteLoader'; // Import the loader component

export default function DiscoverPage() {
  const [images, setImages] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1); // New state for pagination
  const [hasMore, setHasMore] = useState(true); // New state to control "Show More" button visibility
  const router = useRouter();

  const fetchImages = async (pageNumber: number) => {
    try {
      setLoading(true);
      const fetchedImages = await clientApi.getDiscoverImages(pageNumber); // Pass page number
      if (fetchedImages.length === 0) {
        setHasMore(false); // No more images to load
      } else {
        setImages((prevImages) => [...prevImages, ...fetchedImages]); // Append new images
      }
    } catch (err) {
      console.error('Failed to fetch discover images:', err);
      setError('Failed to load images. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(1); // Initial load, fetch first page
  }, []);

  const handleShowMore = () => {
    setPage((prevPage) => prevPage + 1);
    fetchImages(page + 1); // Fetch next page
  };

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-lg">Error: {error}</div>;
  }

  if (images.length === 0 && !loading) { // Only show "No images found" if not loading and no images
    return <div className="flex justify-center items-center h-screen text-lg">No images found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Removed: <h1 className="text-3xl font-bold text-center mb-8">Discover New Images</h1> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((pin) => (
          <div
            key={pin.id}
            className="bg-gray-900 rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 cursor-pointer text-white"
            onClick={() => router.push(`/details/${pin.id}`)}
          >
            <div className="relative w-full h-64">
              <Image
                src={pin.image.url}
                alt={pin.image.alt}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </div>
            <div className="p-4 bg-gray-800 rounded-b-lg">
              <p className="text-white font-semibold text-lg truncate">{pin.title}</p>
              <div className="flex items-center mt-2">
                <p className="text-gray-300 text-sm">By {pin.postedBy.userName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && <ColorPaletteLoader />} {/* Show loader while loading more images */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleShowMore}
            className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg shadow-md hover:scale-105 transition duration-300"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
