import { Client } from "@stomp/stompjs";
import { getUserInfo, isGuest, setGuestInfo } from "../utils/cookie";

const brokerURL = process.env.REACT_APP_WS_ENDPOINT;

function getGuestInfo() {
  setGuestInfo();
  return getUserInfo().userAccount;
}

const client = new Client({
  brokerURL: brokerURL,
  connectHeaders: {
    "User-Account": isGuest() ? getGuestInfo() : getUserInfo(),
  },
});

export default client;
