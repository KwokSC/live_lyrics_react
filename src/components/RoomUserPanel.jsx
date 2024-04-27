import RoomUserInfo from "./RoomUserInfo";
import { useState } from "react";

export default function RoomUserPanel({
  isExpanded,
  setIsExpanded,
  users,
  sendMessage,
}) {
  const [chatMsg, setMsg] = useState("");

  return (
    <div className="room-user-panel">
      <div className={isExpanded ? "expanded-panel" : "expanded-panel hidden"}>
        <div className="panel-header">
          <p>Chat Room</p>
          <button onClick={() => setIsExpanded(false)}>
            <i className="fi fi-rr-cross"></i>
          </button>
        </div>
        <div className="user-list">
          {users.map((user, index) => (
            <RoomUserInfo key={index} user={user} />
          ))}
        </div>
        <div className="chat-box">
          <input
            id="chat-msg"
            value={chatMsg}
            onChange={(e) => {
              setMsg(e.target.value);
            }}
          />
          <button
            onClick={() => {
              setMsg("");
              sendMessage(chatMsg);
            }}
          >
            <i className="fi fi-rr-paper-plane"></i>
          </button>
        </div>
      </div>

      <button
        className="panel-toggle"
        style={{ display: isExpanded ? "none" : "" }}
        onClick={() => {
          setIsExpanded(true);
        }}
      >
        <i className="fi fi-rr-messages"></i>
      </button>
    </div>
  );
}
