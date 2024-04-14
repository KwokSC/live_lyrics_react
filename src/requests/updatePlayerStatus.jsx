import client from "./socket";

export default function updatePlayStatus(currentSong, currentTime, isPlaying) {
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