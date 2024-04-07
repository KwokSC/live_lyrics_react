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
  const [roomOwner, setOwner] = useState("Unknown");
  const [isOnline, setIsOnline] = useState(false);
  const [users, setUsers] = useState([]);
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
    if (response.type === "USER ENTER") {
      setUsers(response.data.users);
    } else if (response.type === "USER EXIT") {
    } else if (response.type === "CHAT") {
    }
  }

  function startLive() {
    api
      .get("/room/startLive", { params: { roomId: roomId } })
      .then((response) => {
        if (response.data.code === 200) {
          setIsOnline(true);
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
    // setCurrentSong(songId);
    // updatePlayStatus(songId, 0, false);
  }

  function getProgrammeById(roomId) {
    base
      .get("/room/getProgrammeById", {
        params: { roomId: roomId },
      })
      .then((response) => {
        const res = response.data.data;
        if (res) {
          setProgramList(res.programListRes);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function getRoomByRoomId(roomId) {
    base
      .get("/room/getRoomByRoomId", { params: { roomId: roomId } })
      .then((response) => {
        if (response.data.data) {
          setTitle(response.data.data.roomTitle);
          setOwner(response.data.data.roomOwner);
        } else {
          navigate("*");
        }
      })
      .catch((error) => {
        console.error(error);
        GlobalErrorContext.current.addErrorMsg(
          "Server error, please try again later."
        );
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
          setUsers(newRoomStatus.users);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function connectToRoom() {
    const client = connectToSockJs();
    client.onConnect = (frame) => {
      console.log(frame);
      setStompClient(client);
      client.subscribe(
        `/topic/${roomId}/public`,
        (message) => onMessageReceived(message),
        {
          UserId: getUserInfo().userAccount,
        }
      );
      client.publish({
        destination: `/app/${roomId}/user.enter`,
        headers: {
          UserId: getUserInfo().userAccount,
        },
      });
    };
    client.activate();
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

    return () => {
      if (stompClient) {
        console.log("Sock Client disconnects.");
        stompClient.publish({
          destination: `/app/${roomId}/user.exit`,
          headers: {
            UserId: getUserInfo().userAccount,
          },
        });
        stompClient.deactivate();
      }
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!roomId) {
      return;
    }
    getRoomByRoomId(roomId);
    getProgrammeById(roomId);
    getPlayStatusById(roomId);
    getRoomStatusById(roomId);
  }, [roomId]);

  useEffect(() => {
    if (isOnline) {
      connectToRoom();
    }
  }, [isOnline]);

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
