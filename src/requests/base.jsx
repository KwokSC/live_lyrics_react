import axios from 'axios';

const baseURL = "http://" + process.env.BACKEND_DOMAIN || "http://localhost:8080";

const base = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json"
    }
})

export default base;