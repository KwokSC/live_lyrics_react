import "./ConsolePage.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeadBar from "../components/HeadBar.jsx";
import PopModal from "../components/PopModal.jsx";
import Overlay from "../components/Overlay.jsx";
import NavBar from "../components/NavBar.jsx";
import Player from "../components/Player.jsx";
import Lyric from "../components/Lyric.jsx";
import ProgramConsoleUnit from "../components/ProgramConsoleUnit.jsx";
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
import { usePlayerContext } from "../components/PlayerContext.jsx";

export default function ConsolePage() {
  const navigate = useNavigate();
  const { addErrorMsg } = useGlobalError();
  const {
    setCurrentSong,
    setCurrentTime,
    setIsPlaying,
    programList,
    setProgramList,
  } = usePlayerContext();
  const [roomId, setRoomId] = useState(null);
  const [roomTitle, setTitle] = useState("Room");
  const [isOnline, setIsOnline] = useState(false);
  const [users, setUsers] = useState([]);

  const [navState, setNavState] = useState(false);
  const [panelState, setPanelState] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyricExpanded, setIsLyricExpanded] = useState(false);
  const [msgList, setMsgList] = useState([]);

  const navItemList = [
    { text: "Programme", onClick: () => navigate("/program") },
    { text: "Profile", onClick: null },
    { text: "Preferences", onClick: null },
  ];

  const endLiveConfirm = (
    <>
      <div className="pop-modal" style={{ display: isModalOpen ? "" : "none" }}>
        <p>{"Are you sure to end live?"}</p>
        <button onClick={endLive}>Yes</button>
        <button onClick={() => setIsModalOpen(false)}>Cancel</button>
      </div>
      <Overlay isCovered={isModalOpen} onClick={() => setIsModalOpen(false)} />
    </>
  );

  function onMessageReceived(message) {
    const response = JSON.parse(message.body);
    console.log(response);
    if (response.type === "USER ENTER") {
      setUsers(response.data.users);
    } else if (response.type === "USER EXIT") {
      setUsers(response.data.users);
    } else if (response.type === "CHAT") {
      handleChatMessage(response.data);
    }
  }

  function handleChatMessage(message) {
    setMsgList((prevMsgList) => [...prevMsgList, message]);
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

  function sendChatMsg(chatMsg) {
    if (client.connected) {
      client.publish({
        destination: `/app/${roomId}/chat`,
        body: JSON.stringify({
          sender: getUserInfo().userAccount,
          content: chatMsg,
        }),
      });
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
        addErrorMsg("Not connected to the room.");
      });
  }

  function endLive() {
    api
      .get("/room/endLive", { params: { roomId: roomId } })
      .then((response) => {
        if (response.data.code === 200) {
          setIsOnline(false);
          setIsModalOpen(false);
        }
      })
      .catch((error) => {
        console.error(error);
        addErrorMsg("Not connected to the room.");
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
          return addErrorMsg("Server error.");
        }
        if (error.response.status === 401) {
          removeAuthToken();
          removeRoomId();
          addErrorMsg("Please log in.");
          navigate("/login");
        }
      });
  }

  function getProgrammeById(roomId) {
    base
      .get("/program/getProgrammeById", {
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
        addErrorMsg("Server error, please try again later.");
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
          setCurrentSong(newPlayStatus.currentSong);
          setCurrentTime(newPlayStatus.currentTime);
          setIsPlaying(newPlayStatus.isPlaying);
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

  // The first time the console page is opened, it check if user is login
  // Then it will connect to the websocket server.
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return addErrorMsg("Please log in.");
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

  return (
    <div className="console-page">
      <PopModal content={endLiveConfirm}/>
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
          if(isOnline){
            setIsModalOpen(true);
          }
        }}
        buttonIcon={<i className="fi fi-sr-leave"></i>}
      />
      <NavBar navState={navState} navItemList={navItemList} />
      <div
        style={{ display: isLyricExpanded ? "none" : "" }}
        className="program-console-container"
      >
        {!isOnline ? (
          <div className="offline-container">
            <p id="info">Room Offline</p>
            <button onClick={startLive}>Start Live</button>
          </div>
        ) : programList.length === 0 ? (
          <p id="info">No program, please add.</p>
        ) : (
          programList.map((program, index) => (
            <ProgramConsoleUnit key={index} program={program} index={index} />
          ))
        )}
      </div>
      <Player isSeekable={true} />
      <Lyric isExpanded={isLyricExpanded} setIsExpanded={setIsLyricExpanded} />
      <RoomUserPanel
        isExpanded={panelState}
        setIsExpanded={setPanelState}
        users={users}
        sendMessage={sendChatMsg}
      />
    </div>
  );
}
