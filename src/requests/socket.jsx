import { Client } from "@stomp/stompjs";

const brokerURL = "ws://" + process.env.BACKEND_DOMAIN + "/ws" || "http://localhost:8080";

const connectToSockJs = () => {

  const client = new Client({
    brokerURL: "ws://localhost:8080/ws",
  });

  return client
};

export default connectToSockJs;
