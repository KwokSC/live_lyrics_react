import { useState } from "react";

export default function ProgramConsole({
  program,
  index,
  currentSong,
  handlePlayAt,
}) {
  const [isIndexHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`program-console-unit ${
        program.song.songId === currentSong ? "active" : ""
      }`}
    >
      <button
        className="program-index"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handlePlayAt(program.song.songId)}
        disabled={program.song.songId === currentSong}
      >
        {isIndexHovered || program.song.songId === currentSong ? (
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
