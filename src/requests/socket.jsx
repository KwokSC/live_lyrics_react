import { Client } from "@stomp/stompjs";

const connectToSockJs = () => {

  const client = new Client({
    brokerURL: `ws://localhost:8080/ws`,
  });

  return client
};

export default connectToSockJs;
