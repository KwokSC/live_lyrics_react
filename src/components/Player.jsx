import { useEffect, useRef, useState } from "react";
import { usePlayerContext } from "./PlayerContext";
import { useGlobalError } from "./GlobalErrorContext";
import client from "../requests/socket";
import base from "../requests/base";
import SeekBar from "./SeekBar";

export default function Player({ isSeekable }) {
  const audioRef = useRef();
  const [audio, setAudio] = useState("");
  const { addErrorMsg } = useGlobalError();
  const { currentSong, currentTime, isPlaying, changeSong, play, pause } =
    usePlayerContext();

  function handleSeekBarChange(event) {}

  function handlePlay() {}

  function handlePrev() {}

  function handleNext() {}

  function handleReplay() {}

  function handleEndLive() {}

  useEffect(() => {
    if (!currentSong.songId) {
      return;
    }
    base
      .get("/song/getAudioById", { params: { songId: currentSong.songId } })
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
      <div className={`player-button ${isSeekable ? "" : "hidden"}`}>
        <button onClick={handlePrev}>
          <i className="fi fi-br-angle-double-left"></i>
        </button>
        <button onClick={handlePlay}>
          {isPlaying ? (
            <i className="fi fi-rr-stop"></i>
          ) : (
            <i className="fi fi-rr-play"></i>
          )}
        </button>
        <button onClick={handleNext}>
          <i className="fi fi-br-angle-double-right"></i>
        </button>
        <button onClick={handleReplay}>
          <i className="fi fi-br-r"></i>
        </button>
        <button onClick={handleEndLive}>
          <i className="fi fi-sr-exit"></i>
        </button>
      </div>
    </div>
  );
}
