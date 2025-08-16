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
  const router = useRouter();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const fetchedImages = await clientApi.getDiscoverImages();
        setImages(fetchedImages);
      } catch (err) {
        console.error('Failed to fetch discover images:', err);
        setError('Failed to load images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return <ColorPaletteLoader />; // Render the loader component
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-lg">Error: {error}</div>;
  }

  if (images.length === 0) {
    return <div className="flex justify-center items-center h-screen text-lg">No images found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Discover New Images</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((pin) => (
          <div
            key={pin.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 cursor-pointer"
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
            <div className="p-4">
              <p className="text-gray-800 font-semibold text-lg truncate">{pin.title}</p>
              <div className="flex items-center mt-2">
                <p className="text-gray-600 text-sm">By {pin.postedBy.userName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
