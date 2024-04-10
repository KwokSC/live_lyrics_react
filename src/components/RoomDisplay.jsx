import { useNavigate } from "react-router-dom";

export default function RoomDisplay({ room }) {
  const navigate = useNavigate();

  return (
    <div
      className="room-display"
      onClick={() => {
        navigate(`/room/${room.roomId}`);
      }}
    >
      <div className="room-header">
        <p>{room.roomTitle}</p>
        <div className="online-count">
          <i className="fi fi-rr-users-alt"></i>
          <p>{room.audienceAmount}</p>
        </div>
      </div>

      <div className="host-card">
        <img src={room.hostInfo.profileImg}></img>
        <div className="overview">
          <p style={{ fontSize: "15px", textTransform: "capitalize" }}>
            {room.hostInfo.userName}
          </p>
          <p
            style={{ fontSize: "10px", fontStyle: "italic", marginTop: "3px" }}
          >
            {"@" + room.hostInfo.userAccount}
          </p>
          <p
            style={{ fontSize: "12px", fontStyle: "italic", marginTop: "5px" }}
          >
            {"'" + room.hostInfo.summary + "'"}
          </p>
          <p style={{ position: "absolute", bottom: "5px" }}>
            {room.song ? "Now:" + room.song.songName : "No current performance."}
          </p>
        </div>
      </div>
    </div>
  );
}
