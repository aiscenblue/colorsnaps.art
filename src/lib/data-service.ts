import { Pin } from '@/lib/redux';
import { encrypt, decrypt } from './utils';

// --- MOCK DATA SERVICE ---
const DataService = {
    register: (username: string, email: string, pass: string) => {
        const usersByEmail = JSON.parse(localStorage.getItem('pins_users_by_email') || '{}');
        const usersByUsername = JSON.parse(localStorage.getItem('pins_users_by_username') || '{}');
        const encryptedEmail = encrypt(email);
        if (encryptedEmail && usersByEmail[encryptedEmail]) return { success: false, message: 'Email already exists.' };
        const encryptedUsername = encrypt(username);
        if (encryptedUsername && usersByUsername[encryptedUsername]) return { success: false, message: 'Username taken.' };
        const userId = `user_${Date.now()}`;
        const newUser = { id: userId, email: encryptedEmail, username: encryptedUsername, pass: encrypt(pass) };
        if (encryptedEmail) usersByEmail[encryptedEmail] = newUser;
        if (encryptedUsername) usersByUsername[encryptedUsername] = newUser;
        localStorage.setItem('pins_users_by_email', JSON.stringify(usersByEmail));
        localStorage.setItem('pins_users_by_username', JSON.stringify(usersByUsername));
        return DataService.login(email, pass);
    },
    login: (identifier: string, pass: string) => {
        const usersByEmail = JSON.parse(localStorage.getItem('pins_users_by_email') || '{}');
        const usersByUsername = JSON.parse(localStorage.getItem('pins_users_by_username') || '{}');
        const encryptedIdentifier = encrypt(identifier);
        const user = encryptedIdentifier && (usersByEmail[encryptedIdentifier] || usersByUsername[encryptedIdentifier]);
        if (user && decrypt(user.pass) === pass) {
            const currentUser = { id: user.id, email: decrypt(user.email), username: decrypt(user.username) };
            localStorage.setItem('pins_currentUser', JSON.stringify(currentUser));
            return { success: true, user: currentUser };
        }
        return { success: false, message: 'Invalid credentials.' };
    },
    logout: () => localStorage.removeItem('pins_currentUser'),
    getCurrentUser: () => {
        const user = localStorage.getItem('pins_currentUser');
        return user ? JSON.parse(user) : null;
    },
    getPins: (): Pin[] => JSON.parse(localStorage.getItem('pins_all') || '[]'),
    savePins: (pins: Pin[]) => localStorage.setItem('pins_all', JSON.stringify(pins)),
    getSavedPinIds: (userId: string) => new Set<string>(JSON.parse(localStorage.getItem(`pins_saved_${userId}`) || '[]')),
    saveSavedPinIds: (userId: string, ids: string[]) => localStorage.setItem(`pins_saved_${userId}`, JSON.stringify(Array.from(ids))),
    getPinById: (pinId: string): Pin | undefined => {
        const allPins = JSON.parse(localStorage.getItem('pins_all') || '[]');
        return allPins.find((p: Pin) => p.id === pinId);
    },
};

export default DataService;
