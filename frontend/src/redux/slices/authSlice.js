import { createSlice } from "@reduxjs/toolkit";

// Get token from localStorage initially
const token = localStorage.getItem("token") || null;
const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

// console.log("User from authSlice:", user);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: user,
        token: token,
        status: "idle",
        error: null,
    },
    reducers: {
        loginUser: (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        registerUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem("token", action.payload.token);
        },
        logoutUser: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
        setAuthError: (state, action) => {
            state.error = action.payload;
        }
    },
});

export const { loginUser, registerUser, logoutUser, setAuthError } = authSlice.actions;
export default authSlice.reducer;
