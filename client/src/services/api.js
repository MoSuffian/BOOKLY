import axios from "axios";

const getBaseURL = () => {
    if (import.meta.env?.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    if (process.env?.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    return "http://localhost:5000/api";
};

const API = axios.create({
    baseURL: getBaseURL()
});

export default API;