import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchData = async () => {
    const response = await api.get("/");
    return response.data;
};
