import { getRoomId, getUserInfo } from "../utils/cookie";
import client from "./socket";

export default function updatePlayStatus(currentSong, currentTime, isPlaying) {
    const roomId = getRoomId()
    if(!roomId){
        return;
    }
    client.publish({
      destination: `/app/${roomId}/status.update`,
      headers: { Type: "PLAYER" },
      body: JSON.stringify({
        currentSong: currentSong,
        currentTime: currentTime,
        isPlaying: isPlaying,
      }),
    });
  }