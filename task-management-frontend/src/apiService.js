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
        const response = await api.get(`/auth`);
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

export async function checkAdmin() {
    try {
        const response = await api.get(`/admin`);
        return response.data;
    } catch (error) {
        throw new Error("Failed to check admin status.");
    }
}

export async function getAllUsers() {
    try {
        const response = await api.get(`/user/all`);
        return response.data.result;
    } catch (error) {
        throw new Error("Failed to get all users.");
    }
}

export async function updateUserDetails(username, user) {
    try {
        const response = await api.put(`/user/${username}/update`, user);
        return response.data;
    } catch (error) {
        throw new Error("Failed to update user.");
    }
}

export async function getAllGroups() {
    try {
        const response = await api.get(`/group/all`);
        return response.data.groups;
    } catch (error) {
        throw new Error("Failed to get all groups.");
    }
}

export async function createUser(user) {
    try {
        const response = await api.post(`/user/new`, user);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "An error occurred");
        } else if (error.request) {
            throw new Error("No response from server");
        } else {
            throw new Error("Error in setting up the request");
        }
    }
}

export async function createGroup(group) {
    try {
        const response = await api.post(`/group/new`, group);
        return response.data;
    } catch (error) {
        throw new Error("Failed to create group.");
    }
}
