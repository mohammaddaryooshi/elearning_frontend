import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PendingOtpContact, User } from "@/types";

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    pendingOtpContact: PendingOtpContact | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
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
        clearAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.pendingOtpContact = null;
        },
    },
});

export const { setPendingOtpContact, clearPendingOtpContact, setUser, clearAuth } =
    authSlice.actions;

export default authSlice.reducer;
