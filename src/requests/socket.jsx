import { Client } from "@stomp/stompjs";

const brokerURL = "ws://" + process.env.EB_ENDPOINT + "/ws" || "http://localhost:8080";

const connectToSockJs = () => {

  const client = new Client({
    brokerURL: brokerURL,
  });

  return client
};

export default connectToSockJs;
