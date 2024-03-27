import React, { createContext, useContext, useEffect, useState } from "react";

const PlayerContext = createContext({
  currentTime: 0,
  songDuration: 0,
  play: undefined,
  pause: undefined,
});

export const usePlayerContext = () => {
  return useContext(PlayerContext);
};

export const PlayerContextProvider = ({ children }) => {
  const [songDuration, setSongDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function changeSong(){
    setCurrentTime(0)
    setIsPlaying(false)
  }

  function play() {
    setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
  }

  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        if (currentTime < songDuration) {
          setCurrentTime((prevTime) => parseInt(prevTime) + 1);
        } else if (currentTime === songDuration) {
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
        currentTime: currentTime,
        songDuration: songDuration,
        play: play,
        pause: pause,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
