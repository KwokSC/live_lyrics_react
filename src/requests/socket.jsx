import { Client } from "@stomp/stompjs";

const brokerURL = process.env.REACT_APP_WS_ENDPOINT;

const client = new Client({
  brokerURL: brokerURL,
});

export default client;
