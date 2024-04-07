import { Client } from "@stomp/stompjs";


const brokerURL = "ws://" + process.env.REACT_APP_ENDPOINT + "/ws";

const connectToSockJs = () => {

  const client = new Client({
    brokerURL: brokerURL,
  });

  return client
};

export default connectToSockJs;
