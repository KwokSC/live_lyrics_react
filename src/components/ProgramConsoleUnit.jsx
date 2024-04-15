import { useEffect, useState } from "react";
import { usePlayerContext } from "./PlayerContext";
import { useGlobalError } from "./GlobalErrorContext";
import client from "../requests/socket";

export default function ProgramConsoleUnit({ program, index }) {
  const [isIndexHovered, setIsHovered] = useState(false);
  const [isCurrentSong, setIsCurrent] = useState(false);
  const { currentSong, changeSong } = usePlayerContext();
  const { addErrorMsg } = useGlobalError();

  function handlePlayAt(song) {
    if (!client.connected) {
      addErrorMsg("You are not connected to the room.");
      return;
    }
    if (!currentSong || song.songId !== currentSong.songId) {
      changeSong(song);
    }
  }

  useEffect(() => {
    if (currentSong && currentSong.songId === program.song.songId) {
      setIsCurrent(true)
    }else{
      setIsCurrent(false)
    }
  }, [currentSong]);

  return (
    <div
      className={`program-console-unit ${
        currentSong && program.song.songId === currentSong.songId
          ? "active"
          : ""
      }`}
    >
      <button
        className="program-index"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handlePlayAt(program.song)}
      >
        {isIndexHovered || isCurrentSong ? (
          <i className="fi fi-rr-play"></i>
        ) : (
          index + 1
        )}
      </button>
      <div style={{ width: "100%" }}>
        <div className="program-console-header">
          <p>{program.song.songName}</p>
        </div>
        <div className="program-console-info">
          <p>{program.song.songArtist}</p>
          <p>
            {(parseInt(program.song.songDuration / 60) % 60) +
              ":" +
              parseInt(program.song.songDuration % 60)}
          </p>
        </div>
      </div>
    </div>
  );
}
