import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';

interface Pin {
    id: string;
    image: {
        url: string;
        alt: string;
        width: number;
        height: number;
    };
    destination: string;
    save: string[]; // Assuming this is an array of user IDs who saved it
    about: string;
    category: string;
    title: string;
    postedBy: {
        _id: string;
        userName: string;
        image: string;
    };
}

interface PinsState {
    all: Pin[];
    savedIds: string[];
}

interface AuthState {
    currentUser: User | null;
}

interface User {
    id: string;
    email: string;
    username: string;
}

interface UiState {
    view: string;
    selectedPinId: string | null;
}

interface RootState {
    pins: PinsState;
    auth: AuthState;
    ui: UiState;
}

interface PinsState {
    all: Pin[];
    savedIds: string[];
    randomPins: Pin[];
}

const pinsSlice = createSlice({
    name: 'pins',
    initialState: { all: [], savedIds: [], randomPins: [] } as PinsState,
    reducers: {
        setPins: (state, action: PayloadAction<Pin[]>) => { state.all = action.payload; },
        addPin: (state, action: PayloadAction<Pin>) => {
            state.all.unshift(action.payload);
        },
        updatePin: (state, action: PayloadAction<Pin>) => {
            const index = state.all.findIndex(p => p.id === action.payload.id);
            if (index !== -1) state.all[index] = action.payload;
        },
        removePin: (state, action: PayloadAction<string>) => {
            state.all = state.all.filter(p => p.id !== action.payload);
        },
        setSavedPinIds: (state, action: PayloadAction<string[]>) => { state.savedIds = action.payload; },
        addSavedPinId: (state, action: PayloadAction<string>) => {
            state.savedIds.push(action.payload);
        },
        removeSavedPinId: (state, action: PayloadAction<string>) => {
            state.savedIds = state.savedIds.filter(id => id !== action.payload);
        },
        setRandomPins: (state, action: PayloadAction<Pin[]>) => { state.randomPins = action.payload; },
        addRandomPins: (state, action: PayloadAction<Pin[]>) => { state.randomPins.push(...action.payload); }
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: { currentUser: null } as AuthState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<User>) => { state.currentUser = action.payload; },
        logout: (state) => { state.currentUser = null; },
    }
});

const uiSlice = createSlice({
    name: 'ui',
    initialState: { view: 'discover', selectedPinId: null } as UiState,
    reducers: {
        setView: (state, action: PayloadAction<string>) => { state.view = action.payload; if (action.payload !== 'detail') state.selectedPinId = null; },
        setSelectedPinId: (state, action: PayloadAction<string | null>) => {
            state.selectedPinId = action.payload;
        },
    }
});

export const store = configureStore({
    reducer: {
        pins: pinsSlice.reducer,
        auth: authSlice.reducer,
        ui: uiSlice.reducer,
    }
});

const selectPins = (state: RootState) => state.pins.all;
const selectCurrentUser = (state: RootState) => state.auth.currentUser;

export const selectDecryptedPins = selectPins;
export const selectDecryptedCurrentUser = selectCurrentUser;

export type { RootState, Pin, User };
export { Provider, useSelector, useDispatch, pinsSlice, authSlice, uiSlice };