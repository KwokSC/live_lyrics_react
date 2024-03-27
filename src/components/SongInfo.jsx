export default function SongInfo({ songInfo, albumCoverURL }) {
  return (
    <div className="song-wrapper">
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
