import axios from "axios";
import store from "@/redux/store";

const api = axios.create({
    baseURL: "https://virtual-deal-room.onrender.com/api",
});

// Attach token dynamically before each request
api.interceptors.request.use((config) => {
    const token = store.getState().auth.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const apiRequest = async (method, url, data = {}) => {
    try {
        const response = await api({
            method,
            url,
            data,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Something went wrong!";
    }
};

export default api;
