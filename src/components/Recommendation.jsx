import { useState } from "react";
import YouTube from "react-youtube";
import ReactMarkdown from "react-markdown";

export default function Recommendation({ reState, onReClick }) {
  const [contentList, setContentList] = useState([
    {
      type: "Text",
      content:
        "# Hello! \n\n This is a **markdown** area. \n\n[Click here](https://www.youtube.com) to visit YouTube.",
    },
  ]);

  const opts = {
    width: "100%",
    height: "300",
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div className={`recommendation ${reState ? "active" : "hidden"}`}>
      <button onClick={onReClick}>{reState ? "\u2716" : "\u2303"}</button>
      <div className="content">
        {contentList.map((content, index) => (
          <div className="recommend-unit" key={index}>
            {content.type === "YouTube" && (
              <YouTube videoId={content.content} opts={opts}></YouTube>
            )}
            {content.type === "Text" && (
              <ReactMarkdown className="markdown-text">
                {content.content}
              </ReactMarkdown>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
