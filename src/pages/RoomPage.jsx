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
import {
  PlayerContextProvider,
  usePlayerContext,
} from "../components/PlayerContext.jsx";
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

export default function RoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const {addErrorMsg} = useGlobalError();

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
  const [songInfo, setSongInfo] = useState({
    songName: "unknown",
    songArtist: "unknown",
    songAlbum: "unknown",
    songDuration: 0,
  });
  const [programList, setProgramList] = useState([]);
  const [lyric, setLyric] = useState([]);
  const [albumCoverURL, setUrl] = useState("");
  const [currentSong, setCurrentSong] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
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
    } else if (response.type === "USER ENTER") {
      setUsers(response.data.users);
    } else if (response.type === "USER EXIT") {
    } else if (response.type === "CHAT") {
      handleChatMessage(response.data);
    }
  }

  function handleLiveStatusChange(status) {
    setIsOnline(status.isOline);
    setUsers(status.users);
  }

  function handlePlayerStatusChange(status) {
    // if(!response){return}
    // const currentSongRes = response.currentSong;
    // const currentTimeRes = response.currentTime;
    // const isPlayingRes = response.isPlaying;
    // if (currentSongRes) {
    //   setCurrentSong(currentSongRes);
    // } else {
    //   setCurrentSong(null);
    // }
    // if (currentTimeRes) {
    //   setCurrentTime(currentTimeRes);
    // }
    // setIsPlaying(isPlayingRes);
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
        addErrorMsg(
          "Server error, please try again later."
        );
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
          setProgramList(programmeRes.programListRes);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function getSongById(id) {
    base
      .get("/song/getSongById", { params: { songId: id } })
      .then((response) => {
        const songInfo = response.data.data;
        if (songInfo) {
          setSongInfo(songInfo);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function getLyricsById(id) {
    base
      .get("/song/getLyricsById", { params: { songId: id } })
      .then((response) => {
        const newLyricList = response.data.data;
        if (newLyricList) {
          setLyric(newLyricList);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function getAlbumCoverById(id) {
    base
      .get("/song/getAlbumCoverById", { params: { songId: id } })
      .then((response) => {
        const newUrl = response.data.data;
        setUrl(newUrl);
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

  function sendMessage(chatMsg) {
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

  // Everytime a new use enter a room, the app tries to subscribe the room
  // topic with specific roomId. If connected, subscribe to the room's playStatus

  useEffect(() => {
    if (isGuest()) {
      setGuestInfo();
    }

    getRoomByRoomId(roomId);
    getProgrammeById(roomId);

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

  // Everytime currentSong changes, the hook should be called.
  // Send a request to get the current song's lyric, album,
  // and songInfo from S3 bucket and MySQL database.
  useEffect(() => {
    if (currentSong) {
      getSongById(currentSong);
      getLyricsById(currentSong);
      getAlbumCoverById(currentSong);
    } else {
      setSongInfo({
        songName: "unknown",
        songArtist: "unknown",
        songAlbum: "unknown",
        songDuration: 0,
      });
      setUrl(null);
      setCurrentTime(0);
      setIsPlaying(false);
      setLyric([]);
    }
  }, [currentSong]);

  // When the room is offline, the current playStatus will be set to default
  useEffect(() => {
    if (isOline) {
      connectToRoom();
    } else {
      setCurrentSong(null);
    }
    // eslint-disable-next-line
  }, [isOline]);

  useEffect(() => {
    getRoomByRoomId(roomId);
    getProgrammeById(roomId);
    getPlayStatusById(roomId);
    getRoomStatusById(roomId);
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
        <SongInfo
          songInfo={songInfo}
          albumCoverURL={albumCoverURL}
          isLyricExpanded={isLyricExpanded}
        />
        <SeekBar isSeekable={false} />
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
        <Recommendation
          reState={reState}
          onReClick={() => {
            setReState(!reState);
          }}
        />
      </div>
  );
}
