import axios from "axios";

const baseURL = process.env.REACT_APP_HTTP_ENDPOINT;

const base = axios.create({
  baseURL: baseURL,
  headers: {
    'Access-Control-Allow-Origin' : '*',
  },
});

export default base;
