import { useEffect, useState, useRef } from "react";
import LangBar from "./LangBar";
import { usePlayerContext } from "./PlayerContext";

export default function Lyric({ lyric }) {
  let timeArr = [];
  let lrcArr = [];

  const [lyricContent, setContent] = useState([]);
  const [lyricTime, setTimeList] = useState([]);
  const [language, setLanguage] = useState("");
  const { currentTime } = usePlayerContext();
  const lyricWrapperRef = useRef(null);

  useEffect(() => {
    const userLanguage = navigator.language || navigator.userLanguage;
    switch (true) {
      case userLanguage.startsWith("en"):
        setLanguage("EN");
        break;
      case userLanguage.startsWith("zh"):
        setLanguage("CN");
        break;
      default:
        setLanguage("EN");
        break;
    }
  }, []);

  useEffect(() => {
    scrollToCurrentLyric();
  }, [currentTime]);

  // Each time language is reset, the lyrics will change to the specific version.
  useEffect(() => {
    if (lyric) {
      const currentLyric = lyric.find((lrc) => lrc.language === language);
      if (currentLyric) {
        scrollToCurrentLyric();
        reformatLrc(currentLyric.content);
      } else {
        setContent(["No lyric to display."]);
        setTimeList([]);
      }
    }
  }, [language, lyric]);

  function reformatLrc(lyricContent) {
    if (lyricContent) {
      const strArr = lyricContent.split("\n");
      strArr.forEach((item) => {
        const timeRegex = /\[(\d{2}:\d{2}\.\d{2})\]/;
        const match = item.match(timeRegex);
        if (match) {
          timeArr.push(timeFormat(match[1]));
          lrcArr.push(item.replace(timeRegex, "").trim());
        }
      });
      setContent(lrcArr);
      setTimeList(timeArr);
    }
  }

  function timeFormat(timeStr) {
    if (timeStr) {
      const timeStrArr = timeStr.split(":");
      const minute =
        timeStrArr[0][0] === "0" ? timeStrArr[0][1] : timeStrArr[0];
      const second =
        timeStrArr[1][0] === "0" ? timeStrArr[1][1] : timeStrArr[1];
      return parseInt(minute) * 60 + parseInt(second);
    }
  }

  function getCurrentLyricIndex() {
    // Obtain index based on current time.
    const currentLyricIndex = lyricTime.findIndex((time, index) => {
      const nextTime = lyricTime[index + 1];
      return time <= currentTime && (nextTime ? currentTime < nextTime : true);
    });
    return currentLyricIndex;
  }

  function scrollToCurrentLyric() {
    // Scroll to the current lyric and make it center.
    if (lyricWrapperRef.current) {
      const currentLyricIndex = getCurrentLyricIndex();
      if (currentLyricIndex !== -1) {
        const lyricItem = lyricWrapperRef.current.children[currentLyricIndex];
        const lyricWrapperHeight = lyricWrapperRef.current.offsetHeight;
        const lyricItemHeight = lyricItem.offsetHeight;
        const scrollPosition =
          lyricItem.offsetTop - lyricWrapperHeight / 2 + lyricItemHeight / 2;
        lyricWrapperRef.current.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      }
    }
  }

  return (
    <div className="lyric-wrapper">
      <ul className="lyric-content" ref={lyricWrapperRef}>
        {lyricContent.map((line, index) => (
          <li
            className={index === getCurrentLyricIndex() ? "highlight" : ""}
            key={index}
          >
            {line}
          </li>
        ))}
      </ul>
      <LangBar language={language} setLanguage={setLanguage} />
    </div>
  );
}
