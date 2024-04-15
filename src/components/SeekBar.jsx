import { useEffect, useState } from "react";
import { usePlayerContext } from "./PlayerContext";

export default function SeekBar({ isSeekable, handleSeekBarChange }) {
  const [durationDisplay, setDurationDisplay] = useState("");
  const [currentDisplay, setCurrentDisplay] = useState("");
  const { currentTime, currentSong } = usePlayerContext();

  useEffect(() => {
    if(currentSong && currentSong.songDuration){
      const songSecond = parseInt(currentSong.songDuration % 60);
      const songMinute = parseInt((currentSong.songDuration / 60) % 60);
      setDurationDisplay(songMinute + ":" + songSecond);
    }else{
      setDurationDisplay("0:0");
    }
  }, [currentSong]);

  useEffect(() => {
    const currentSecond = parseInt(currentTime % 60);
    const currentMinute = parseInt((currentTime / 60) % 60);
    setCurrentDisplay(currentMinute + ":" + currentSecond);
  }, [currentTime]);

  return (
    <div className="player-seekbar">
      <span>{currentDisplay}</span>
      <input
        type="range"
        className="seek-bar"
        step={1}
        value={currentTime}
        min={0}
        max={currentSong?currentSong.songDuration:"0:0"}
        readOnly={!isSeekable}
        onChange={isSeekable ? handleSeekBarChange : null}
      />
      <span>{durationDisplay}</span>
    </div>
  );
}
