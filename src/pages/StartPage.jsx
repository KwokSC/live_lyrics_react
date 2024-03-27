import { useState } from "react";
import "./StartPage.scss";
import api from "../requests/api";
import { useNavigate } from "react-router-dom";
import { useGlobalError } from "../components/GlobalErrorContext";

export default function StartPage() {
  const navigate = useNavigate();
  const {addErrorMsg} = useGlobalError();
  const [roomTitle, setTitle] = useState("");

  function handleSubmit() {
    api
      .post("/room/createRoom", { roomTitle: roomTitle })
      .then((response) => {
        if (response.data.code === 201) {
          navigate("/console");
        }
      })
      .catch((error) => {
        console.error(error)
        addErrorMsg("Server error, please try again.");
      });
  }

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
