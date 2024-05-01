import "./RoomPage.scss";
import NavBar from "../components/NavBar.jsx";
import Overlay from "../components/Overlay.jsx";
import HeadBar from "../components/HeadBar.jsx";
import HostInfo from "../components/HostInfo.jsx";
import SeekBar from "../components/SeekBar.jsx";
import Lyric from "../components/Lyric.jsx";
import SongInfo from "../components/SongInfo.jsx";
import Recommendation from "../components/Recommendation.jsx";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalError } from "../components/GlobalErrorContext.jsx";
import { usePlayerContext } from "../components/PlayerContext.jsx";
import {
  getUserInfo,
  isAuthenticated,
  isGuest,
  setGuestInfo,
  storeUserInfo,
} from "../utils/cookie.jsx";
import client from "../requests/socket.jsx";
import base from "../requests/base.jsx";
import DonationWindow from "../components/DonationWindow.jsx";
import RoomUserPanel from "../components/RoomUserPanel.jsx";
import DanmuScreen from "../components/DanmuScreen.jsx";
import { StompHeaders } from "@stomp/stompjs";

export default function RoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { addErrorMsg } = useGlobalError();
  const { setProgramList, setCurrentSong, setCurrentTime, setIsPlaying } = usePlayerContext();

  const [navState, setNavState] = useState(false);
  const [reState, setReState] = useState(false);
  const [hoState, setHoState] = useState(false);
  const [doState, setDoState] = useState(false);
  const [panelState, setPanelState] = useState(false);
  const [isLyricExpanded, setIsLyricExpanded] = useState(false);

  const [roomTitle, setTitle] = useState("Room");
  const [hostInfo, setHostInfo] = useState({
    userAccount: "Unknown",
    userName: "Unknown",
    summary: "N/A",
  });
  const [isOline, setIsOnline] = useState(false);
  const [users, setUsers] = useState([]);
  const [msgList, setMsgList] = useState([]);

  const navItemList = [
    {
      text: "Explore",
      onClick: () => {
        navigate("/explore");
      },
    },
    { text: "Following", onClick: null },
    { text: "Payment", onClick: null },
    { text: "Preferences", onClick: null },
  ];

  // The websocket connection subscribed /playStatus callback function
  function onMessageReceived(message) {
    const response = JSON.parse(message.body);
    console.log(response);
    if (response.type === "ROOM") {
      handleLiveStatusChange(response.data);
    } else if (response.type === "PLAYER") {
      handlePlayerStatusChange(response.data);
    } else if (
      response.type === "USER ENTER" ||
      response.type === "USER EXIT"
    ) {
      setUsers(response.data.users);
    } else if (response.type === "CHAT") {
      handleChatMessage(response.data);
    }
  }

  function handleLiveStatusChange(status) {
    setIsOnline(status.isOline);
    setUsers(status.users);
  }

  function handlePlayerStatusChange(status) {
    setCurrentSong(status.currentSong);
    setCurrentTime(status.currentTime);
    setIsPlaying(status.isPlaying);
  }

  function handleChatMessage(message) {
    setMsgList((prevMsgList) => [...prevMsgList, message]);
  }

  function getRoomByRoomId(roomId) {
    base
      .get("/room/getRoomByRoomId", { params: { roomId: roomId } })
      .then((response) => {
        const roomRes = response.data.data;
        if (roomRes) {
          setTitle(roomRes.roomTitle);
          base
            .get("/user/getProfileByAccount", {
              params: { account: roomRes.roomOwner },
            })
            .then((response) => {
              const profileRes = response.data.data;
              if (profileRes) {
                setHostInfo(profileRes);
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          navigate("*");
        }
      })
      .catch((error) => {
        console.error(error);
        addErrorMsg("Server error, please try again later.");
      });
  }

  function getProgrammeById(roomId) {
    base
      .get("/room/getProgrammeById", {
        params: { roomId: roomId },
      })
      .then((response) => {
        const programmeRes = response.data.data;
        if (programmeRes) {
          setProgramList(programmeRes.programList);
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
        { UserId: getUserInfo().userId }
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

  useEffect(() => {
    if (isGuest()) {
      setGuestInfo();
    }

    getProgrammeById(roomId);
    getRoomByRoomId(roomId);

    return () => {
      if (client.connected) {
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

  // When the room is offline, the current playStatus will be set to default
  useEffect(() => {
    if (isOline) {
      connectToRoom();
    }else{
      setCurrentSong(null)
    }
    // eslint-disable-next-line
  }, [isOline]);

  useEffect(() => {
    if(roomId){
      getRoomByRoomId(roomId);
      getProgrammeById(roomId);
      getRoomStatusById(roomId);
    }
  }, [roomId]);

  return (
    <div className="room-page">
      <Overlay
        isCovered={navState || reState || doState}
        onClick={() => {
          setNavState(false);
          setReState(false);
          setDoState(false);
        }}
      />
      <DanmuScreen messages={msgList} />
      <HeadBar
        navState={navState}
        handleNavClick={() => {
          setNavState(!navState);
        }}
        displayText={roomTitle}
        handleBtnClick={() => {
          setHoState(!hoState);
        }}
        buttonIcon={<i className="fi fi-rr-circle-user"></i>}
      />
      <NavBar navState={navState} navItemList={navItemList} />
      <HostInfo
        hoState={hoState}
        setDoState={setDoState}
        hostName={hostInfo.userName}
        profileImg={hostInfo.profileImg}
        summary={hostInfo.summary}
      />
      <DonationWindow doState={doState} setDoState={setDoState} />
      <SongInfo isLyricExpanded={isLyricExpanded} />
      <SeekBar isSeekable={false} />
      <Lyric isExpanded={isLyricExpanded} setIsExpanded={setIsLyricExpanded} />
      <RoomUserPanel
        isExpanded={panelState}
        setIsExpanded={setPanelState}
        users={users}
        sendMessage={sendChatMsg}
      />
      <Recommendation
        reState={reState}
        onReClick={() => {
          setReState(!reState);
        }}
      />
    </div>
  );
}
