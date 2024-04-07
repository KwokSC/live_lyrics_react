import { useEffect, useState } from "react";
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

export default function AddProgramPage() {
  const navigate = useNavigate();
  const { addErrorMsg } = useGlobalError();
  const [newProgramId, setNewId] = useState(undefined);
  const [songName, setSongName] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songAlbum, setSongAlbum] = useState("");
  const [albumCover, setAlbumCover] = useState(null);
  const [audio, setAudio] = useState(null);
  const [lyricList, setLyricList] = useState([
    {
      lang: "",
      file: "",
    },
  ]);
  const [recommendationList, setRecommendationList] = useState([
    {
      type: "",
      content: "",
    },
  ]);

  function handleBack() {
    navigate("/program");
  }

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

  function uploadSongInfo() {
    const song = {
      songId: "song_" + newProgramId,
      songName: songName,
      songAlbum: songAlbum,
      songArtist: songArtist,
    };
    api
      .post("/song/uploadSong", song)
      .then((response) => {})
      .catch((error) => {});
  }

  function uploadProgram() {
    const program = {
      songId: "song_" + newProgramId,
      recommendations: recommendationList,
    };
    api
      .post("/program/uploadProgram", program, {
        params: {
          roomId: getRoomId(),
        },
      })
      .then((response) => {})
      .catch((error) => {});
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

    const audioFormData = transformFile(audio, "audio");
    const albumCoverFormData = transformFile(albumCover, "album");
    const lyricFormData = transformLyrics(lyricList);

    const filesData = [
      { endPoint: "/song/uploadAudio", formData: audioFormData },
      { endPoint: "/song/uploadAlbumCover", formData: albumCoverFormData },
      { endPoint: "/song/uploadLyric", formData: lyricFormData },
    ];

    uploadFiles(filesData)
      .then((results) => {
        // All files uploaded successfully
        console.log("Upload results:", results);
      })
      .catch((error) => {
        // Error occurred during file upload
        console.error("Upload error:", error);
      });
  }

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

  function deleteFile() {
    setAlbumCover(null);
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
      <div className="program-bar">
        <button onClick={() => handleBack()}>&#x00AB;</button>
        <p>New Program</p>
        <button onClick={() => handleSubmit()}>&#x2713;</button>
      </div>
      <div className="program-container">
        <p>Album Cover</p>
        <div className="upload-slot">
          {albumCover ? (
            <div className="img-preview">
              <img src={albumCover} />
              <button onClick={() => deleteFile()}>&#x2716;</button>
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
