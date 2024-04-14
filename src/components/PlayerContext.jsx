import React, { createContext, useContext, useEffect, useState } from "react";

const PlayerContext = createContext({
  currentSong: null,
  currentTime: 0,
  play: undefined,
  pause: undefined,
  changeSong: undefined
});

export const usePlayerContext = () => {
  return useContext(PlayerContext);
};

export const PlayerContextProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState({});
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
        currentTime: currentTime,
        play: play,
        pause: pause,
        changeSong: changeSong
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
