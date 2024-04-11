import axios from "axios";

const baseURL = "https://" + process.env.REACT_APP_ENDPOINT;

const base = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default base;
