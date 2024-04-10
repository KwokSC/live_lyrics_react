import Cookies from "js-cookie";

import { v4 as uuidv4 } from "uuid";

function generateUserId() {
  const uuid = uuidv4();
  const userId = uuid.substring(0, 8);
  return userId;
}

export function setAuthToken(token) {
  Cookies.set("auth", token);
}

export function removeAuthToken() {
  Cookies.remove("auth");
}

export function getAuthToken() {
  return Cookies.get("auth");
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function storeRoomId(id) {
  Cookies.set("roomId", id);
}

export function removeRoomId() {
  Cookies.remove("roomId");
}

export function getRoomId() {
  return Cookies.get("roomId");
}

export function isRoomConnected() {
  return Boolean(getRoomId());
}

export function storeUserInfo(info) {
  Cookies.set("userInfo", JSON.stringify(info));
}

export function removeUserInfo() {
  Cookies.remove("userInfo");
}

export function getUserInfo() {
  if (Cookies.get("userInfo")) {
    return JSON.parse(Cookies.get("userInfo"));
  }
  return null;
}

export function isGuest() {
  return Boolean(!getUserInfo());
}

export function setGuestInfo() {
  const userId = generateUserId();
  Cookies.set(
    "userInfo",
    JSON.stringify({
      userId: userId,
      userAccount: userId,
      userName: "guest_" + userId,
    })
  );
}
