import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export async function login(username, password) {
    try {
        const response = await api.post(`/login`, {
            username,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error(
            "Login failed. Please check your username and password."
        );
    }
}

export async function checkAuth() {
    try {
        const response = await api.get(`/checkAuth`);
        return response.data;
    } catch (error) {
        throw new Error("Authentication failed.");
    }
}

export async function logout() {
    try {
        const response = await api.post(`/logout`);
        return response.data;
    } catch (error) {
        throw new Error("Logout failed.");
    }
}

export async function getUser() {
    try {
        const response = await api.get(`/user/me`);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || "Failed to get user.");
    }
}

export async function updateEmail(email) {
    try {
        const response = await api.put(`/user/me/email`, { email });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response.data.message || "Failed to update email."
        );
    }
}

export async function updatePassword(password) {
    try {
        const response = await api.put(`/user/me/password`, { password });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response.data.message || "Failed to update password."
        );
    }
}
