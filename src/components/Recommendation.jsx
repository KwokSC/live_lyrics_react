import { useEffect, useState } from "react";
import YouTube from "react-youtube";
import ReactMarkdown from "react-markdown";
import { usePlayerContext } from "./PlayerContext";

export default function Recommendation({ reState, onReClick }) {
  const { currentSong, programList } = usePlayerContext();

  const [contentList, setContentList] = useState([]);

  const opts = {
    width: "100%",
    height: "300",
    playerVars: {
      autoplay: 0,
    },
  };

  function display(content) {
    if (content.type === "Youtube") {
      return (
        <YouTube
          className="youtube-video"
          videoId={content.content}
          opts={opts}
        />
      );
    }
    if (content.type === "Text") {
      return (
        <ReactMarkdown className="markdown-text">
          {content.content}
        </ReactMarkdown>
      );
    }
  }

  useEffect(() => {
    if (!currentSong || !programList) {
      return;
    }
    setContentList(
      programList.find((program) => program.song.songId === currentSong.songId)
        .recommendations
    );
  }, [currentSong, programList]);

  return (
    <div className={`recommendation ${reState ? "active" : "hidden"}`}>
      <button onClick={onReClick}>{reState ? "\u2716" : "\u2303"}</button>
      <div className="content">
        {contentList.map((content, index) => (
          <div className="recommend-unit" key={index}>
            {display(content)}
          </div>
        ))}
      </div>
    </div>
  );
}
