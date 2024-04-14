import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalError } from "../components/GlobalErrorContext.jsx";
import { v4 as uuidv4 } from "uuid";
import base from "../requests/base.jsx";
import api from "../requests/api.jsx";
import {
  isAuthenticated,
  getAuthToken,
  isRoomConnected,
  removeRoomId,
  storeRoomId,
  getRoomId,
} from "../utils/cookie.jsx";
import PopModal from "../components/PopModal.jsx"
import Overlay from "../components/Overlay.jsx";

export default function AddProgramPage() {
  const navigate = useNavigate();
  const { addErrorMsg } = useGlobalError();

  const [isModalOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newProgramId, setNewId] = useState(undefined);
  const [songName, setSongName] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songAlbum, setSongAlbum] = useState("");
  const [songDuration, setDuration] = useState(0);
  const [albumCover, setAlbumCover] = useState(null);
  const [audio, setAudio] = useState(null);
  const [lyricList, setLyricList] = useState([]);
  const [recommendationList, setRecommendationList] = useState([]);
  const statusTextRef = useRef();
  const statusImgRef = useRef();

  const uploadingWindow = (
    <>
      <div className="pop-modal" style={{ display: isModalOpen ? "" : "none" }}>
        <p ref={statusTextRef}></p>
        <i ref={statusImgRef}></i>
      </div>
      <Overlay
        isCovered={isModalOpen}
        onClick={() => {
          if (isUploading) {
            return;
          }
          setIsOpen(false);
        }}
      />
    </>
  );

  function transformFile(file, filePrefix) {
    if (!file) {
      return null;
    }
    const formData = new FormData();
    const blob = new Blob([file], { type: file.type });
    formData.append(filePrefix, blob, filePrefix + "_" + newProgramId);
    return formData;
  }

  function transformLyrics(lyrics) {
    const formData = new FormData();
    lyrics.forEach((item) => {
      if (!item.file) {
        return;
      }
      const blob = new Blob([item.file], { type: item.file.type });
      formData.append("lyric", blob, "lyric_" + item.lang + "_" + newProgramId);
    });
    return formData;
  }

  function uploadSong() {
    const song = {
      songId: "song_" + newProgramId,
      songName: songName,
      songAlbum: songAlbum,
      songArtist: songArtist,
      songDuration: songDuration,
    };
    return api.post("/song/uploadSong", song);
  }

  function uploadProgram() {
    const program = {
      songId: "song_" + newProgramId,
      recommendations: recommendationList,
    };
    return api.post("/program/uploadProgram", program, {
      params: {
        roomId: getRoomId(),
      },
    });
  }

  function uploadFiles(endpointsAndDataArray) {
    const uploadPromises = endpointsAndDataArray.map(
      ({ endPoint, formData }) => {
        return new Promise((resolve, reject) => {
          api
            .post(endPoint, formData)
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
        });
      }
    );

    return Promise.all(uploadPromises);
  }

  function validateForm() {
    let result = true;
    if (!audio) {
      addErrorMsg("Please upload audio file.");
    }

    lyricList.forEach((item) => {
      if (item.lang === "" && item.file !== "") {
        addErrorMsg("Please specify the language for each lyric file.");
        result = false;
      }
    });

    recommendationList.forEach((item) => {
      if (item.type === "" && item.content !== "") {
        addErrorMsg("Please specify the type for each recommendation content.");
        result = false;
      }
    });
    return result;
  }

  function handleSubmit() {
    if (!validateForm) {
      return;
    }

    setIsOpen(true)
    setIsUploading(true);
    statusTextRef.current.innerText =
      "New program is uploading, please do not close the window...";
    statusImgRef.current.className = "fi fi-rr-cloud-upload";

    const song = {
      songId: "song_" + newProgramId,
      songName: songName,
      songAlbum: songAlbum,
      songArtist: songArtist,
      songDuration: songDuration,
    };
    const program = {
      songId: "song_" + newProgramId,
      recommendations: recommendationList,
    };

    const formData = new FormData();
    formData.append("roomId", getRoomId());
    formData.append("song", JSON.stringify(song));
    formData.append("program", JSON.stringify(program));
    const audioBlob = new Blob([audio], { type: audio.type });
    const imgBlob = new Blob([albumCover], { type: albumCover.type });
    formData.append("audio", audioBlob, "audio_" + newProgramId);
    formData.append("album", imgBlob, "album_" + newProgramId);

    lyricList.forEach((item) => {
      if (!item.file) {
        return;
      }
      const blob = new Blob([item.file], { type: "text/plain" });
      formData.append("lyric", blob, "lyric_" + item.lang + "_" + newProgramId);
    });

    api
      .post("/song/submit", formData)
      .then((response) => {
        if (response.data.code === 200) {
          statusTextRef.current.innerText =
            "Congrats! You new program was uploaded successfully.";
          statusImgRef.current.className = "fi fi-rr-cloud-check";
          setTimeout(() => {
            navigate("/program");
          }, 3000);
        }
      })
      .catch((error) => {
        setIsUploading(false)
        statusTextRef.current.innerText =
          "Sorry we failed to upload the program, please try again.";
        statusImgRef.current.className = "fi fi-rr-cloud-exclamation";
        console.error(error);
      });
  }

  async function submitAsync() {}

  function handleLangSelectChange(event, index) {
    const updatedList = [...lyricList];
    updatedList[index].lang = event.target.value;
    setLyricList(updatedList);
  }

  function handleDeleteLang(index) {
    const updatedList = [...lyricList];
    updatedList.splice(index, 1);
    setLyricList(updatedList);
  }

  function handleAddNewLang() {
    const updatedList = [...lyricList];
    updatedList.push({ lang: "", file: "" });
    setLyricList(updatedList);
  }

  function handleTypeSelectChange(event, index) {
    const updatedList = [...recommendationList];
    updatedList[index].type = event.target.value;
    setRecommendationList(updatedList);
  }

  function handleContentChange(event, index) {
    const updatedList = [...recommendationList];
    updatedList[index].content = event.target.value;
    setRecommendationList(updatedList);
  }

  function handleDeleteRecommend(index) {
    const updatedList = [...recommendationList];
    updatedList.splice(index, 1);
    setRecommendationList(updatedList);
  }

  function handleAddNewRecommend() {
    const updatedList = [...recommendationList];
    updatedList.push({ type: "", content: "" });
    setRecommendationList(updatedList);
  }

  function handleAlbumSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      setAlbumCover(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleAudioSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.addEventListener("loadedmetadata", () => {
      const durationInSeconds = parseInt(audio.duration);
      setDuration(durationInSeconds);
    });
    const reader = new FileReader();
    reader.onload = function (event) {
      setAudio(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleLyricSelect(event, index) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      const updatedList = [...lyricList];
      updatedList[index].file = event.target.result;
      setLyricList(updatedList);
    };
    reader.readAsDataURL(file);
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
        })
        .catch((error) => {
          console.error(error);
        });
    }
    setNewId(uuidv4().slice(0, 12));
  }, []);

  return (
    <div className="add-program-page">
      <PopModal content={uploadingWindow} />
      <div className="program-bar">
        <button onClick={() => navigate("/program")}>&#x00AB;</button>
        <p>New Program</p>
        <button disabled={isUploading} onClick={() => handleSubmit()}>
          &#x2713;
        </button>
      </div>
      <div className="program-container">
        <p>Album Cover</p>
        <div className="upload-slot">
          {albumCover ? (
            <div className="img-preview">
              <img src={albumCover} />
              <button onClick={() => setAlbumCover(null)}>&#x2716;</button>
            </div>
          ) : (
            <button
              className="uploader-button"
              onClick={() =>
                document.getElementById("album-cover-upload").click()
              }
            >
              <i className="fi fi-rr-upload"></i>
              <input
                id="album-cover-upload"
                className="file-input-slot"
                type="file"
                accept="image/*"
                onChange={(e) => handleAlbumSelect(e)}
              />
            </button>
          )}
        </div>
        <p>Audio File</p>
        <button
          className="audio-uploader-button"
          onClick={() => document.getElementById("audio-upload").click()}
        >
          {audio ? (
            <i className="fi fi-rr-document">
              <p>{document.getElementById("audio-upload").files[0].name}</p>
            </i>
          ) : (
            <i className="fi fi-rr-upload"></i>
          )}

          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={(e) => handleAudioSelect(e)}
          />
        </button>
        <p>Lyric File</p>
        {lyricList.map((item, index) => (
          <div className="lyric-uploader" key={index}>
            <select
              id={`lrc-language-${index}`}
              value={item.lang}
              onChange={(e) => handleLangSelectChange(e, index)}
            >
              <option value="">Language</option>
              <option value="CN">CN</option>
              <option value="EN">EN</option>
            </select>

            <button
              className="lrc-uploader-button"
              onClick={() =>
                document.getElementById(`lrc-upload-${index}`).click()
              }
            >
              {item.file ? (
                <i className="fi fi-rr-document">
                  <p>
                    {
                      document.getElementById(`lrc-upload-${index}`).files[0]
                        .name
                    }
                  </p>
                </i>
              ) : (
                <i className="fi fi-rr-upload"></i>
              )}

              <input
                id={`lrc-upload-${index}`}
                type="file"
                accept=".lrc"
                onChange={(e) => handleLyricSelect(e, index)}
              />
            </button>

            <button onClick={() => handleDeleteLang(index)}>
              <i className="fi fi-rr-trash"></i>
            </button>
          </div>
        ))}
        <button onClick={handleAddNewLang}>
          <i className="fi fi-rr-add"></i>
        </button>
        <p>Song</p>
        <input
          id="song-name"
          type="text"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
        ></input>
        <p>Album</p>
        <input
          id="album-name"
          type="text"
          value={songAlbum}
          onChange={(e) => setSongAlbum(e.target.value)}
        />
        <p>Artist</p>
        <input
          id="artist-name"
          type="text"
          value={songArtist}
          onChange={(e) => setSongArtist(e.target.value)}
        />
        <p>Recommendation</p>
        {recommendationList.map((item, index) => (
          <div className="recommend-uploader" key={index}>
            <div className="uploader-button">
              <select
                id={`rec-type-${index}`}
                value={item.type}
                onChange={(e) => handleTypeSelectChange(e, index)}
              >
                <option value="">Type</option>
                <option value="YouTube">Youtube</option>
                <option value="Text">Text</option>
              </select>
              <button onClick={() => handleDeleteRecommend(index)}>
                <i className="fi fi-rr-trash"></i>
              </button>
            </div>
            <textarea
              id={`rec-content-${index}`}
              value={item.content}
              onChange={(e) => handleContentChange(e, index)}
            ></textarea>
          </div>
        ))}
        <button onClick={handleAddNewRecommend}>
          <i className="fi fi-rr-add"></i>
        </button>
      </div>
    </div>
  );
}
