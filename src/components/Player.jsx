import { useEffect, useRef, useState } from "react";
import { usePlayerContext } from "./PlayerContext";
import { useGlobalError } from "./GlobalErrorContext";
import base from "../requests/base";
import SeekBar from "./SeekBar";
import api from "../requests/api";
import { getRoomId } from "../utils/cookie";

export default function Player({ isSeekable }) {
  const audioRef = useRef();
  const [audio, setAudio] = useState("");
  const {
    programList,
    currentSong,
    currentTime,
    isPlaying,
    changeSong,
    play,
    pause,
    seek,
    replay,
  } = usePlayerContext();

  function handleSeekBarChange(event) {
    seek(event.target.value);
    audioRef.current.currentTime = event.target.value;
  }

  function handlePlay() {
    if (isPlaying) {
      pause();
      audioRef.current.currentTime = currentTime;
      audioRef.current.pause();
    } else {
      play();
      audioRef.current.currentTime = currentTime;
      audioRef.current.play();
    }
  }

  function handlePrev() {
    const currentIndex = programList.findIndex(
      (program) => program.song.songId === currentSong.songId
    );
    if (currentIndex === 0) {
      return;
    }
    changeSong(programList[currentIndex - 1].song);
  }

  function handleNext() {
    const currentIndex = programList.findIndex(
      (program) => program.song.songId === currentSong.songId
    );
    if (currentIndex === programList.length - 1) {
      return;
    }
    changeSong(programList[currentIndex + 1].song);
  }

  function handleReplay() {
    replay();
    audioRef.current.currentTime = 0;
    audioRef.current.pause();
  }

  function handleEndLive() {
    api.get("/room/endLive", { params: { roomId: getRoomId() } });
  }

  useEffect(() => {
    if (!currentSong || !currentSong.songId) {
      return;
    }
    base
      .get("/program/getAudioById", { params: { songId: currentSong.songId } })
      .then((response) => {
        const newAudio = response.data.data;
        setAudio(newAudio);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [currentSong]);

  return (
    <div className="player-wrapper">
      <SeekBar
        isSeekable={isSeekable}
        handleSeekBarChange={handleSeekBarChange}
      />
      <audio ref={audioRef} src={audio}></audio>
      {isSeekable ? (
        <div className="player-button">
          <button disabled={!currentSong} onClick={handlePrev}>
            <i className="fi fi-br-angle-double-left"></i>
          </button>
          <button
            disabled={!currentSong || currentTime >= currentSong.songDuration}
            onClick={handlePlay}
          >
            {isPlaying ? (
              <i className="fi fi-rr-stop"></i>
            ) : (
              <i className="fi fi-rr-play"></i>
            )}
          </button>
          <button disabled={!currentSong} onClick={handleNext}>
            <i className="fi fi-br-angle-double-right"></i>
          </button>
          <button disabled={!currentSong} onClick={handleReplay}>
            <i className="fi fi-br-r"></i>
          </button>
          <button onClick={handleEndLive}>
            <i className="fi fi-sr-exit"></i>
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
