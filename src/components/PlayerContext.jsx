import React, { createContext, useContext, useEffect, useState } from "react";
import { getRoomId } from "../utils/cookie";
import client from "../requests/socket";

const PlayerContext = createContext({
  programList: [],
  setProgramList: undefined,
  currentSong: null,
  setCurrentSong: undefined,
  currentTime: 0,
  setCurrentTime: undefined,
  isPlaying: false,
  setIsPlaying: undefined,
  play: undefined,
  pause: undefined,
  seek: undefined,
  replay: undefined,
  changeSong: undefined,
});

export const usePlayerContext = () => {
  return useContext(PlayerContext);
};

export const PlayerContextProvider = ({ children }) => {
  const [programList, setProgramList] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function changeSong(song) {
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(false);
    updatePlayStatus(song, 0, false)
  }

  function seek(time) {
    setCurrentTime(time);
    updatePlayStatus(currentSong, time, isPlaying)
  }

  function play() {
    setIsPlaying(true);
    updatePlayStatus(currentSong, currentTime, true)
  }

  function pause() {
    setIsPlaying(false);
    updatePlayStatus(currentSong, currentTime, false)
  }

  function replay() {
    setCurrentTime(0);
    setIsPlaying(false);
    updatePlayStatus(currentSong, 0, false)
  }

  function updatePlayStatus(song, time, isPlaying) {
    const roomId = getRoomId();
    if (!roomId) {
      return;
    }
    client.publish({
      destination: `/app/${roomId}/status.update`,
      headers: { Type: "PLAYER" },
      body: JSON.stringify({
        currentSong: song,
        currentTime: time,
        isPlaying: isPlaying,
      }),
    });
  }

  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setCurrentTime((prevTime) => parseInt(prevTime) + 1);
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isPlaying]);

  useEffect(() => {
    if (currentSong && currentTime >= currentSong.songDuration) {
      setIsPlaying(false);
    }
  }, [currentTime]);

  return (
    <PlayerContext.Provider
      value={{
        programList:programList,
        setProgramList: setProgramList,
        currentSong: currentSong,
        setCurrentSong: setCurrentSong,
        currentTime: currentTime,
        setCurrentTime: setCurrentTime,
        isPlaying: isPlaying,
        setIsPlaying: setIsPlaying,
        play: play,
        pause: pause,
        seek: seek,
        replay: replay,
        changeSong: changeSong,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
