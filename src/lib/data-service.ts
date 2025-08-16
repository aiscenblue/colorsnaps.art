import 'server-only';
import { createClient } from 'redis';
import { Pin, User } from '@/lib/redux';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

connectRedis();

const DataService = {
    register: async (username: string, email: string, pass: string): Promise<{ success: boolean, message?: string, user?: User }> => {
        await connectRedis();
        const userByEmail = await redisClient.hGet('users_by_email', email);
        if (userByEmail) return { success: false, message: 'Email already exists.' };
        const userByUsername = await redisClient.hGet('users_by_username', username);
        if (userByUsername) return { success: false, message: 'Username taken.' };

        const userId = `user_${Date.now()}`;
        const newUser: User = { id: userId, email, username };
        const userWithPass = { ...newUser, pass };

        await redisClient.hSet('users_by_email', email, JSON.stringify(userWithPass));
        await redisClient.hSet('users_by_username', username, JSON.stringify(userWithPass));
        await redisClient.hSet('users', userId, JSON.stringify(newUser));

        return { success: true, user: newUser };
    },
    login: async (identifier: string, pass: string): Promise<{ success: boolean, message?: string, token?: string }> => {
        await connectRedis();
        let userWithPassJson = await redisClient.hGet('users_by_email', identifier);
        if (!userWithPassJson) {
            userWithPassJson = await redisClient.hGet('users_by_username', identifier);
        }

        if (userWithPassJson) {
            const userWithPass = JSON.parse(userWithPassJson);
            if (userWithPass.pass === pass) {
                const token = `token_${Date.now()}`;
                await redisClient.hSet('sessions', token, userWithPass.id);
                return { success: true, token };
            }
        }
        return { success: false, message: 'Invalid credentials.' };
    },
    getUserFromToken: async (token: string): Promise<User | null> => {
        await connectRedis();
        const userId = await redisClient.hGet('sessions', token);
        if (userId) {
            return await DataService.getCurrentUser(userId);
        }
        return null;
    },
    logout: async (): Promise<void> => {
        // No server-side logout needed for this implementation
    },
    getCurrentUser: async (userId: string): Promise<User | null> => {
        await connectRedis();
        const userJson = await redisClient.hGet('users', userId);
        return userJson ? JSON.parse(userJson) : null;
    },
    getPins: async (): Promise<Pin[]> => {
        await connectRedis();
        const pinKeys = await redisClient.keys('pin:*');
        if (pinKeys.length === 0) return [];
        const pins = await redisClient.mGet(pinKeys);
        return pins.map(p => JSON.parse(p!));
    },
    savePins: async (pins: Pin[]) => {
        await connectRedis();
        const multi = redisClient.multi();
        for (const pin of pins) {
            multi.set(`pin:${pin.id}`, JSON.stringify(pin));
        }
        await multi.exec();
    },
    getSavedPinIds: async (userId: string): Promise<Set<string>> => {
        await connectRedis();
        const savedIds = await redisClient.sMembers(`saved_pins:${userId}`);
        return new Set(savedIds);
    },
    saveSavedPinIds: async (userId: string, ids: string[]) => {
        await connectRedis();
        const key = `saved_pins:${userId}`;
        await redisClient.del(key);
        if (ids.length > 0) {
            await redisClient.sAdd(key, ids);
        }
    },
    getPinById: async (pinId: string): Promise<Pin | undefined> => {
        await connectRedis();
        const pin = await redisClient.get(`pin:${pinId}`);
        return pin ? JSON.parse(pin) : undefined;
    },
    removePin: async (pinId: string): Promise<void> => {
        await connectRedis();
        await redisClient.del(`pin:${pinId}`);
    },
    updatePin: async (pin: Pin): Promise<void> => {
        await connectRedis();
        await redisClient.set(`pin:${pin.id}`, JSON.stringify(pin));
    },
};

export default DataService;
