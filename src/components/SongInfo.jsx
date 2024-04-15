import { useEffect, useState } from "react";
import { usePlayerContext } from "./PlayerContext";
import base from "../requests/base";

export default function SongInfo({ isLyricExpanded }) {
  const { currentSong } = usePlayerContext();
  const [url, setUrl] = useState("");

  function getAlbumCoverById(id) {
    base
      .get("/song/getAlbumCoverById", { params: { songId: id } })
      .then((response) => {
        const newUrl = response.data.data;
        setUrl(newUrl);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    if (!currentSong || !currentSong.songId) {
      return;
    }
    getAlbumCoverById(currentSong.songId);
  }, [currentSong]);

  return (
    <div
      className="song-wrapper"
      style={{ display: isLyricExpanded ? "none" : "" }}
    >
      <div className="album-wrapper">
        {url ? (
          <img alt="album-cover" src={url} />
        ) : (
          <i className="fi fi-sr-record-vinyl"></i>
        )}
      </div>
      <h2>{currentSong ? currentSong.songName : "Unknown"}</h2>
      <p>{currentSong ? currentSong.songArtist : "Unknown"}</p>
    </div>
  );
}
