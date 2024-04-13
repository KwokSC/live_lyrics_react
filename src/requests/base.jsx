import axios from "axios";

const baseURL = process.env.REACT_APP_HTTP_ENDPOINT;

const base = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default base;
