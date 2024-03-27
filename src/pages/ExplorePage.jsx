import "./ExplorePage.scss";
import RoomDisplay from "../components/RoomDisplay";
import { useEffect, useState } from "react";

export default function ExplorePage() {
  const [navState, setNavState] = useState(false);
  const [roomList, setRoomList] = useState([
    {
      roomTitle: "test",
      roomOwner: "test_owner",
    },
    {
      roomTitle: "test2",
      roomOwner: "test_owner2",
    },
    {
      roomTitle: "test3",
      roomOwner: "test_owner3",
    },
    {
      roomTitle: "test4",
      roomOwner: "test_owner3",
    },
  ]);

  function onNavClick() {
    setNavState(!navState);
  }
  function getPopularRoom() {}

  useEffect(() => {
    getPopularRoom();
  }, []);

  return (
    <div className="explore-page">
      <div
        className="overlay"
        style={{ display: navState ? "" : "none" }}
        onClick={() => setNavState(false)}
      />
      <div className="head-bar">
        <button
          className={`menu-toggle ${navState ? "active" : ""}`}
          onClick={onNavClick}
        >
          <span />
          <span />
          <span />
        </button>
        <p>Explore</p>
        <button>
          <i className="fi fi-sr-album"></i>
        </button>
      </div>
      <div className={`nav-bar ${navState ? "active" : "hidden"}`}>
        <button className="nav-item">Explore</button>
        <button className="nav-item">Following</button>
        <button className="nav-item">Payment</button>
        <button className="nav-item">Preferences</button>
        <button className="nav-item">Exit</button>
      </div>
      <div className="room-container">
        {roomList.map((room, index) => (
          <RoomDisplay key={index} room={room} />
        ))}
      </div>
    </div>
  );
}
