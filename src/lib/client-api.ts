import { Pin } from '@/lib/redux';

export const clientApi = {
    getDiscoverImages: async (page: number = 1): Promise<Pin[]> => {
        const response = await fetch(`/api/images/discover?page=${page}`);
        const data = await response.json();
        if (!response.ok) {
            console.error('Failed to get discover images:', data.error);
            return [];
        }
        return data.images || [];
    },
};