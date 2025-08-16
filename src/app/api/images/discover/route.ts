import { NextResponse } from 'next/server';
import DataService from '@/lib/data-service';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
  };
  alt_description: string;
  width: number;
  height: number;
  links: {
    html: string;
  };
  description: string;
  topic_submissions?: Record<string, unknown>;
  user: {
    id: string;
    username: string;
    name: string;
    profile_image: {
      medium: string;
    };
  };
}

export async function GET() {
  try {
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!unsplashAccessKey) {
      return NextResponse.json({ error: 'Unsplash Access Key not configured' }, { status: 500 });
    }

    const response = await fetch(`https://api.unsplash.com/photos/random?count=30&client_id=${unsplashAccessKey}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching from Unsplash:', errorData);
      return NextResponse.json({ error: 'Failed to fetch images from Unsplash' }, { status: response.status });
    }

    const images: UnsplashImage[] = await response.json();

    const pins = images.map((image: UnsplashImage) => ({
      id: image.id,
      image: {
        url: image.urls.regular,
        alt: image.alt_description || 'Unsplash image',
        width: image.width,
        height: image.height,
      },
      destination: image.links.html,
      save: [], // Assuming no save data for direct Unsplash pins
      about: image.description || image.alt_description || '',
      category: image.topic_submissions ? Object.keys(image.topic_submissions)[0] : 'Uncategorized',
      title: image.description || image.alt_description || `Image by ${image.user.name}`,
      postedBy: {
        _id: image.user.id,
        userName: image.user.username,
        image: image.user.profile_image.medium,
      },
    }));

    // Store pins in Redis using DataService
    for (const pin of pins) {
      await DataService.savePin(pin);
    }

    return NextResponse.json({ images: pins });
  } catch (error) {
    console.error('Error retrieving images from Unsplash:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
