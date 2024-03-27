import { useEffect, useState } from "react";
import { usePlayerContext } from "./PlayerContext";

export default function SeekBar({ isSeekable, handleSeekBarChange }) {
  const [durationDisplay, setDurationDisplay] = useState("");
  const [currentDisplay, setCurrentDisplay] = useState("");
  const { currentTime, songDuration } = usePlayerContext();

  useEffect(() => {
    const songSecond = parseInt(songDuration % 60);
    const songMinute = parseInt((songDuration / 60) % 60);
    setDurationDisplay(songMinute + ":" + songSecond);
  }, [songDuration]);

  useEffect(() => {
    const currentSecond = parseInt(currentTime % 60);
    const currentMinute = parseInt((currentTime / 60) % 60);
    setCurrentDisplay(currentMinute + ":" + currentSecond);
  }, [currentTime]);

  return (
    <div className="player-seekbar">
      <span id="current-time">{currentDisplay}</span>
      <input
        type="range"
        className="seek-bar"
        step={1}
        value={currentTime}
        min={0}
        max={songDuration}
        readOnly={!isSeekable}
        onChange={isSeekable ? handleSeekBarChange : null}
      />
      <span id="duration">{durationDisplay}</span>
    </div>
  );
}
