export default function SongInfo({ songInfo, albumCoverURL, isLyricExpanded }) {
  return (
    <div
      className="song-wrapper"
      style={{ display: isLyricExpanded ? "none" : "" }}
    >
      <div className="album-wrapper">
        {albumCoverURL ? (
          <img alt="album-cover" src={albumCoverURL} />
        ) : (
          <i className="fi fi-sr-record-vinyl"></i>
        )}
      </div>
      <h2>{songInfo.songName}</h2>
      <p>{songInfo.songArtist}</p>
    </div>
  );
}
