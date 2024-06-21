import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
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
