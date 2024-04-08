import { useEffect, useRef, useState } from "react";
import SeekBar from "./SeekBar";
import { usePlayerContext } from "./PlayerContext";

export default function Player({ isSeekable, audio }) {
  const audioRef = useRef();
  const { isPlaying } = usePlayerContext();

  function handleSeekBarChange(event) {}

  function handlePlay() {}

  function handlePrev() {}

  function handleNext() {}

  function handleReplay() {}

  function handleEndLive() {}

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
