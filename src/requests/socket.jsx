import { Client } from "@stomp/stompjs";

const brokerURL = "wss://" + process.env.REACT_APP_ENDPOINT + "/ws";

const client = new Client({
  brokerURL: brokerURL,
});

export default client;
