import "server-only";
import redisClient from "@/lib/redis";
import { Pin, User } from "@/lib/redux";

const connectRedis = async () => {
  // ioredis automatically connects, so no explicit connect call needed here
  // However, we can ensure it's ready by waiting for the 'ready' event or checking connection status if needed.
  // For simplicity, we'll assume it's connected or will connect soon.
};

const DataService = {
  register: async (
    username: string,
    email: string,
    pass: string,
  ): Promise<{ success: boolean; message?: string; user?: User }> => {
    await connectRedis();
    const userByEmail = await redisClient.hget("users_by_email", email);
    if (userByEmail)
      return { success: false, message: "Email already exists." };
    const userByUsername = await redisClient.hget(
      "users_by_username",
      username,
    );
    if (userByUsername) return { success: false, message: "Username taken." };

    const userId = `user_${Date.now()}`;
    const newUser: User = { id: userId, email, username };
    const userWithPass = { ...newUser, pass };

    await redisClient.hset(
      "users_by_email",
      email,
      JSON.stringify(userWithPass),
    );
    await redisClient.hset(
      "users_by_username",
      username,
      JSON.stringify(userWithPass),
    );
    await redisClient.hset("users", userId, JSON.stringify(newUser));

    return { success: true, user: newUser };
  },
  login: async (
    identifier: string,
    pass: string,
  ): Promise<{ success: boolean; message?: string; token?: string }> => {
    await connectRedis();
    let userWithPassJson = await redisClient.hget("users_by_email", identifier);
    if (!userWithPassJson) {
      userWithPassJson = await redisClient.hget(
        "users_by_username",
        identifier,
      );
    }

    if (userWithPassJson) {
      const userWithPass = JSON.parse(userWithPassJson);
      if (userWithPass.pass === pass) {
        const token = `token_${Date.now()}`;
        await redisClient.hset("sessions", token, userWithPass.id);
        return { success: true, token };
      }
    }
    return { success: false, message: "Invalid credentials." };
  },
  getUserFromToken: async (token: string): Promise<User | null> => {
    await connectRedis();
    const userId = await redisClient.hget("sessions", token);
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
    const userJson = await redisClient.hget("users", userId);
    return userJson ? JSON.parse(userJson) : null;
  },
  getAllUsers: async (): Promise<User[]> => {
    await connectRedis();
    const userHashes = await redisClient.hgetall("users");
    return Object.values(userHashes).map((userJson) => JSON.parse(userJson));
  },
  getPins: async (): Promise<Pin[]> => {
    
    await connectRedis();
    const pinKeys = await redisClient.keys("pin:*");
    if (pinKeys.length === 0) return [];
    const pins = await redisClient.mget(pinKeys);
    return pins.map((p) => JSON.parse(p!));
  },
  savePin: async (pin: Pin): Promise<void> => {
    await connectRedis();
    const existingPin = await DataService.getPinById(pin.id);
    if (!existingPin) {
      await redisClient.set(`pin:${pin.id}`, JSON.stringify(pin));
    }
  },
  savePins: async (pins: Pin[]) => {
    await connectRedis();
    for (const pin of pins) {
      await DataService.savePin(pin);
    }
  },
  getSavedPinIds: async (userId: string): Promise<Set<string>> => {
    await connectRedis();
    const savedIds = await redisClient.smembers(`saved_pins:${userId}`);
    return new Set(savedIds);
  },
  getAllSavedPins: async (): Promise<Record<string, string[]>> => {
    await connectRedis();
    const savedPinsKeys = await redisClient.keys("saved_pins:*");
    const allSavedPins: Record<string, string[]> = {};
    for (const key of savedPinsKeys) {
      const userId = key.replace("saved_pins:", "");
      allSavedPins[userId] = await redisClient.smembers(key);
    }
    return allSavedPins;
  },
  saveSavedPinIds: async (userId: string, ids: string[]) => {
    await connectRedis();
    const key = `saved_pins:${userId}`;
    await redisClient.del(key);
    if (ids.length > 0) {
      await redisClient.sadd(key, ids);
    }
  },
  getPinById: async (pinId: string): Promise<Pin | undefined> => {
    
    await connectRedis();
    
    const pin = await redisClient.get(`pin:${pinId}`);
    
    if (pin) {
      try {
        const parsedPin = JSON.parse(pin);
        
        return parsedPin;
      } catch (e) {
        console.error(`Error parsing pin JSON for ID ${pinId}:`, e);
        console.error(`Raw pin data:`, pin);
        return undefined;
      }
    }
    console.log(`Pin with ID: ${pinId} not found in Redis.`);
    return undefined;
  },
  removePin: async (pinId: string): Promise<void> => {
    await connectRedis();
    await redisClient.del(`pin:${pinId}`);
  },
  clearAllPins: async (): Promise<void> => {
    await connectRedis();
    const pinKeys = await redisClient.keys("pin:*");
    if (pinKeys.length > 0) {
      await redisClient.del(...pinKeys);
    }
  },
  updatePin: async (pin: Pin): Promise<void> => {
    await connectRedis();
    await redisClient.set(`pin:${pin.id}`, JSON.stringify(pin));
  },
};

export default DataService;
