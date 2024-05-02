import "./ProgramPage.scss";
import { Fragment, useEffect, useState } from "react";
import PopModal from "../components/PopModal.jsx";
import Overlay from "../components/Overlay";
import { useNavigate } from "react-router-dom";
import base from "../requests/base.jsx";
import { useGlobalError } from "../components/GlobalErrorContext.jsx";
import {
  isAuthenticated,
  getAuthToken,
  getRoomId,
  storeRoomId,
  removeRoomId,
  isRoomConnected,
} from "../utils/cookie.jsx";

export default function ProgramPage() {
  const navigate = useNavigate();
  const { addErrorMsg } = useGlobalError();
  const [programList, setProgramList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programIdToDelete, setProgramIdToDelete] = useState("");

  const deleteConfirm = (
    <>
      <div className="pop-modal" style={{ display: isModalOpen ? "" : "none" }}>
        <p>{"Are you sure to delete program" + { programIdToDelete } + "?"}</p>
        <button onClick={confirmDelete}>Yes</button>
        <button onClick={() => setIsModalOpen(false)}>Cancel</button>
      </div>
      <Overlay isCovered={isModalOpen} onClick={() => setIsModalOpen(false)} />
    </>
  );

  function handleDelete(programIdToDelete) {
    setProgramIdToDelete(programIdToDelete);
    setIsModalOpen(true);
  }

  function confirmDelete() {
    // TODO: send delete request
    const newProgramList = programList.filter(
      (program) => program.programId !== programIdToDelete
    );
    setProgramList(newProgramList);
    setIsModalOpen(false);
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      removeRoomId();
      return addErrorMsg("Please log in.");
    }
    if (!isRoomConnected()) {
      base
        .get("/room/getRoomByUserId", {
          headers: { Authorization: getAuthToken() },
        })
        .then((response) => {
          if (response.data.data.roomId) {
            storeRoomId(response.data.data.roomId);
          }
        });
    }
    base
      .get("/program/getProgrammeById", { params: { roomId: getRoomId() } })
      .then((response) => {
        console.log(response.data);
        if (response.data.data) {
          setProgramList(response.data.data.programList);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="program-page">
      <div className="program-bar">
        <button onClick={() => navigate("/console")}>&#x00AB;</button>
        <p>Program List</p>
        <button onClick={() => navigate("/program/add")}>&#x002B;</button>
      </div>
      <div className="program-container">
        {programList.length === 0 ? (
          <p className="empty-programme">No program, please add.</p>
        ) : (
          <Fragment>
            {programList.map((program, index) => (
              <div className="program-unit" key={index} draggable={true}>
                <div className="program-header">
                  <p>{program.song.songName}</p>
                  <div className="program-edit">
                    <button
                      onClick={() =>
                        navigate(`/program/edit/${program.song.programId}`)
                      }
                    >
                      <i className="fi fi-rr-file-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(program.programId)}>
                      <i className="fi fi-rr-cross-circle"></i>
                    </button>
                  </div>
                </div>
                <div className="program-info">
                  <p>{program.song.songArtist}</p>
                  <p>
                    {(parseInt(program.song.songDuration / 60) % 60) +
                      ":" +
                      parseInt(program.song.songDuration % 60)}
                  </p>
                </div>
              </div>
            ))}
          </Fragment>
        )}
      </div>
      <PopModal content={deleteConfirm} />
    </div>
  );
}
