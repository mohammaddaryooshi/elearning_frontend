import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PendingOtpContact, User } from "@/features/auth/types";

interface AuthState {
    isAuthenticated: boolean;
    isAuthReady: boolean;
    user: User | null;
    pendingOtpContact: PendingOtpContact | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthReady: false,
    user: null,
    pendingOtpContact: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setPendingOtpContact: (
            state,
            action: PayloadAction<PendingOtpContact>
        ) => {
            state.pendingOtpContact = action.payload;
        },
        clearPendingOtpContact: (state) => {
            state.pendingOtpContact = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setAuthReady: (state) => {
            state.isAuthReady = true;
        },
        clearAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.pendingOtpContact = null;
        },
    },
});

export const {
    setPendingOtpContact,
    clearPendingOtpContact,
    setUser,
    clearAuth,
    setAuthReady
} = authSlice.actions;

export default authSlice.reducer;
