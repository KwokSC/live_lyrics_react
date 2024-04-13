import "./ConsolePage.scss";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeadBar from "../components/HeadBar.jsx";
import Overlay from "../components/Overlay.jsx";
import NavBar from "../components/NavBar.jsx";
import Player from "../components/Player.jsx";
import Lyric from "../components/Lyric.jsx";
import ProgramConsoleUnit from "../components/ProgramConsoleUnit.jsx";
import { PlayerContextProvider } from "../components/PlayerContext.jsx";
import { useGlobalError } from "../components/GlobalErrorContext.jsx";
import {
  isAuthenticated,
  removeAuthToken,
  removeRoomId,
  storeRoomId,
  getUserInfo,
} from "../utils/cookie.jsx";
import client from "../requests/socket.jsx";
import base from "../requests/base.jsx";
import api from "../requests/api.jsx";
import RoomUserPanel from "../components/RoomUserPanel.jsx";
import DanmuScreen from "../components/DanmuScreen.jsx";

export default function ConsolePage() {
  const navigate = useNavigate();
  const GlobalErrorContext = useRef(useGlobalError());
  const [roomId, setRoomId] = useState(null);
  const [roomTitle, setTitle] = useState("Room");
  const [isOnline, setIsOnline] = useState(false);
  const [users, setUsers] = useState([]);

  const [navState, setNavState] = useState(false);
  const [panelState, setPanelState] = useState(false);
  const [isLyricExpanded, setIsLyricExpanded] = useState(false);

  const [programList, setProgramList] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [audio, setAudio] = useState(null);
  const [lyric, setLyric] = useState([]);
  const [msgList, setMsgList] = useState([]);

  const navItemList = [
    { text: "Profile", onClick: null },
    { text: "Preferences", onClick: null },
  ];

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
      handleChatMessage(response.data);
    }
  }

  function handleChatMessage(message) {
    setMsgList((prevMsgList) => [...prevMsgList, message]);
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

  function getRoomByUserId() {
    api
      .get("/room/getRoomByUserAccount")
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
      client.publish({
        destination: `/app/${roomId}/status.update`,
        headers: { Type: "PLAYER" },
        body: JSON.stringify({
          currentSong: currentSong,
          currentTime: currentTime,
          isPlaying: isPlaying,
        }),
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
          setProgramList(res.programList);
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
        const room = response.data.data;
        if (room) {
          setTitle(room.roomTitle);
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
    client.onConnect = (frame) => {
      console.log(frame);
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

  function sendMessage(chatMsg) {
    if(client.connected){
      client.publish({
        destination: `/app/${roomId}/chat`,
        body: JSON.stringify({
          sender: getUserInfo().userAccount,
          content: chatMsg,
        }),
      });
    }
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
      if (client.connected) {
        console.log("Sock Client disconnects.");
        client.publish({
          destination: `/app/${roomId}/user.exit`,
          headers: {
            UserId: getUserInfo().userAccount,
          },
        });
        client.deactivate();
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
        <DanmuScreen messages={msgList} />
        <Overlay
          isCovered={navState}
          onClick={() => {
            setNavState(false);
          }}
        />
        <HeadBar
          navState={navState}
          handleNavClick={() => {
            setNavState(!navState);
          }}
          displayText={roomTitle}
          handleBtnClick={() => {
            navigate("/program");
          }}
          buttonIcon={<i className="fi fi-sr-album"></i>}
        />
        <NavBar navState={navState} navItemList={navItemList} />
        <div
          style={{ display: isLyricExpanded ? "none" : "" }}
          className="program-console-container"
        >
          {ConsoleDisplay()}
        </div>
        <Player audio={audio} isSeekable={true} />
        <Lyric
          lyric={lyric}
          isExpanded={isLyricExpanded}
          setIsExpanded={setIsLyricExpanded}
        />
        <RoomUserPanel
          isExpanded={panelState}
          setIsExpanded={setPanelState}
          users={users}
          sendMessage={sendMessage}
        />
      </div>
    </PlayerContextProvider>
  );
}
