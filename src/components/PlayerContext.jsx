import React, { createContext, useContext, useEffect, useState } from "react";
import { getRoomId } from "../utils/cookie";
import client from "../requests/socket";

const PlayerContext = createContext({
  currentSong: null,
  setCurrentSong: undefined,
  currentTime: 0,
  setCurrentTime: undefined,
  isPlaying: false,
  setIsPlaying: undefined,
  play: undefined,
  pause: undefined,
  replay: undefined,
  changeSong: undefined
});

export const usePlayerContext = () => {
  return useContext(PlayerContext);
};

export const PlayerContextProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function changeSong(song){
    setCurrentSong(song)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  function play() {
    setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
  }

  function replay(){
    setCurrentTime(0);
    setIsPlaying(false);
  }

  function updatePlayStatus() {
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

  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        if (currentTime < currentSong.songDuration) {
          setCurrentTime((prevTime) => parseInt(prevTime) + 1);
        } else if (currentTime === currentSong.songDuration) {
          setIsPlaying(false);
        }
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isPlaying]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong: currentSong,
        setCurrentSong: setCurrentSong,
        currentTime: currentTime,
        setCurrentTime: setCurrentTime,
        isPlaying: isPlaying,
        setIsPlaying: setIsPlaying,
        play: play,
        pause: pause,
        replay: replay,
        changeSong: changeSong
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
