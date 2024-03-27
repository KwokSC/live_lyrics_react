import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Player from "../components/Player.jsx";
import "./ConsolePage.scss";
import connectToSockJs from "../requests/socket.jsx";
import Lyric from "../components/Lyric.jsx";
import { PlayerContextProvider } from "../components/PlayerContext.jsx";
import { useGlobalError } from "../components/GlobalErrorContext.jsx";
import ProgramConsoleUnit from "../components/ProgramConsoleUnit.jsx";
import {
  isAuthenticated,
  removeAuthToken,
  removeRoomId,
  storeRoomId,
  getUserInfo,
} from "../utils/cookie.jsx";
import base from "../requests/base.jsx";
import api from "../requests/api.jsx";

export default function ConsolePage() {
  const navigate = useNavigate();
  const GlobalErrorContext = useRef(useGlobalError());
  const [roomId, setRoomId] = useState(null);
  const [roomTitle, setTitle] = useState("Room");
  const [isOnline, setIsOnline] = useState(false);
  const [navState, setNavState] = useState(false);
  const [programList, setProgramList] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [audio, setAudio] = useState(null);
  const [lyric, setLyric] = useState([]);

  const ConsoleDisplay = () => {
    if (!isOnline) {
      return (
        <div className="offline-container">
          <p id="info">Room Offline</p>
          <button onClick={startLive}>Start Live</button>
        </div>
      );
    }

    return (
      <>
        {programList.length === 0 ? (
          <p id="info">No program, please add.</p>
        ) : (
          programList.map((program, index) => (
            <ProgramConsoleUnit
              key={index}
              program={program}
              index={index}
              currentSong={currentSong}
              handlePlayAt={handlePlayAt}
            />
          ))
        )}
      </>
    );
  };

  function findSongDuration() {
    const program = programList.find(
      (program) => program.song.songId === currentSong
    );
    if (program) {
      return program.song.songDuration;
    }
    return 0;
  }

  function onMessageReceived(message) {
    const response = JSON.parse(message.body);
    console.log(response);
  }

  function startLive() {
    api
      .get("/room/startLive", { params: { roomId: roomId } })
      .then((response) => {
        if (response.data.code === 200) {
          setIsOnline(true);
          stompClient.subscribe(
            `/topic/${roomId}/public`,
            (message) => onMessageReceived(message),
            {
              UserId: getUserInfo().userAccount,
            }
          );
        }
      })
      .catch((error) => {
        console.error(error);
        GlobalErrorContext.current.addErrorMsg("Not connected to the room.");
      });
  }

  function withStompClient(action) {
    if (!stompClient || !stompClient.connected) {
      GlobalErrorContext.current.addErrorMsg("Not connected to the room.");
      return;
    }
    action();
  }

  function getRoomByUserId() {
    api
      .get("/room/getRoomByUserId")
      .then((response) => {
        if (response.data.data) {
          setRoomId(response.data.data.roomId);
          storeRoomId(response.data.data.roomId);
          setTitle(response.data.data.roomTitle);
        } else {
          navigate("/start");
        }
      })
      .catch((error) => {
        console.error(error);
        if (error.code === "ERR_NETWORK") {
          return GlobalErrorContext.current.addErrorMsg("Server error.");
        }
        if (error.response.status === 401) {
          removeAuthToken();
          removeRoomId();
          GlobalErrorContext.current.addErrorMsg("Please log in.");
          navigate("/login");
        }
      });
  }

  function updatePlayStatus(currentSong, currentTime, isPlaying) {
    withStompClient(() => {
      stompClient.send(
        `/app/${roomId}/status.update`,
        { Type: "PLAYER" },
        JSON.stringify({
          currentSong: currentSong,
          currentTime: currentTime,
          isPlaying: isPlaying,
        })
      );
    });
  }

  function handlePlayAt(songId) {
    setCurrentSong(songId);
    // TODO:
    updatePlayStatus(songId, 0, false);
  }

  function getProgrammeById(roomId) {
    base
      .get("/room/getProgrammeById", {
        params: { roomId: roomId },
      })
      .then((response) => {
        const programListRes = response.data.data.programList;
        if (programListRes) {
          setProgramList(programListRes);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function getPlayStatusById(roomId) {
    base
      .get("/room/getPlayStatusById", {
        params: { roomId: roomId },
      })
      .then((response) => {
        const newPlayStatus = response.data.data;
        if (newPlayStatus) {
          //TODO
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function getRoomStatusById(roomId) {
    base
      .get("/room/getRoomStatusById", {
        params: { roomId: roomId },
      })
      .then((response) => {
        const newRoomStatus = response.data.data;
        if (newRoomStatus) {
          setIsOnline(newRoomStatus.isOnline);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // The first time the console page is opened, it check if user is login
  // Then it will connect to the websocket server.
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return GlobalErrorContext.current.addErrorMsg("Please log in.");
    } else {
      getRoomByUserId();
    }

    connectToSockJs("", getUserInfo().userAccount)
      .then((client) => {
        setStompClient(client);
        console.log("Connected");
      })
      .catch((error) => {
        console.error(error);
        GlobalErrorContext.current.addErrorMsg("Fail to connect to the room.");
      });

    return () => {
      if (stompClient) {
        console.log("Sock Client disconnects.");
        stompClient.send(`/${roomId}/user.exit`, {
          UserId: getUserInfo().userAccount,
        });
        stompClient.disconnect();
      }
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!roomId) {
      return;
    }
    getProgrammeById(roomId);
    getPlayStatusById(roomId);
    getRoomStatusById(roomId);
  }, [roomId]);

  useEffect(() => {
    if (!currentSong) {
      return;
    }
    base
      .get("/song/getLyricsById", { params: { songId: currentSong } })
      .then((response) => {
        const newLyricList = response.data.data;
        if (newLyricList) {
          setLyric(newLyricList);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    base
      .get("/song/getAudioById", { params: { songId: currentSong } })
      .then((response) => {
        const newAudio = response.data.data;
        setAudio(newAudio);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [currentSong]);

  return (
    <PlayerContextProvider>
      <div className="console-page">
        <div
          className="overlay"
          style={{ display: navState ? "" : "none" }}
          onClick={() => setNavState(false)}
        ></div>
        <div className="head-bar">
          <button
            className={`menu-toggle ${navState ? "active" : ""}`}
            onClick={() => setNavState(!navState)}
          >
            <span />
            <span />
            <span />
          </button>
          <p className="room-title">{roomTitle}</p>
          <button onClick={() => navigate("/program")}>
            <i className="fi fi-sr-album"></i>
          </button>
        </div>
        <div className={`nav-bar ${navState ? "active" : "hidden"}`}>
          <button className="nav-item">Profile</button>
          <button className="nav-item">Preferences</button>
          <button className="nav-item">Logout</button>
        </div>
        <div className="program-console-container">{ConsoleDisplay()}</div>
        <Player audio={audio} isSeekable={true} />
        <Lyric lyric={lyric} />
      </div>
    </PlayerContextProvider>
  );
}
