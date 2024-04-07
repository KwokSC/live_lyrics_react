import { useEffect, useState } from "react";
import "./StartPage.scss";
import api from "../requests/api";
import { useNavigate } from "react-router-dom";
import { useGlobalError } from "../components/GlobalErrorContext";
import { isAuthenticated } from "../utils/cookie.jsx";

export default function StartPage() {
  const navigate = useNavigate();
  const { addErrorMsg } = useGlobalError();
  const [roomTitle, setTitle] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    api
      .post("/room/createRoom", { roomTitle: roomTitle })
      .then((response) => {
        if (response.data.code === 200) {
          navigate("/console");
        }
      })
      .catch((error) => {
        console.error(error);
        addErrorMsg("Server error, please try again.");
      });
  }

  function getRoomByUserId() {
    api
      .get("/room/getRoomByUserId")
      .then((response) => {
        if (response.data.data) {
          navigate("/console");
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

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return GlobalErrorContext.current.addErrorMsg("Please log in.");
    } else {
      getRoomByUserId();
    }
  }, []);

  return (
    <div className="start-page">
      <form className="room-form" onSubmit={handleSubmit}>
        <h1>Start from here...</h1>
        <p>Give an interesting name for your room</p>
        <input
          placeholder="Title"
          value={roomTitle}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
