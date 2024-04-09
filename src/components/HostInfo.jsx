export default function HostInfo({
  hoState,
  setDoState,
  profileImg,
  hostName,
  summary,
}) {
  return (
    <div className={`host-info ${hoState ? "active" : "hidden"}`}>
      <img src={profileImg}></img>
      <p style={{ textTransform: "capitalize", fontSize: "20px" }}>
        {hostName}
      </p>
      <div className="social-media">
        <button>
          <i className="fi fi-brands-instagram"></i>
        </button>
        <button>
          <i className="fi fi-brands-twitter-alt-circle"></i>
        </button>
        <button>
          <i className="fi fi-brands-tik-tok"></i>
        </button>
      </div>
      <p style={{ fontStyle: "italic", marginTop: "10px" }}>
        {"'" + summary + "'"}
      </p>
      <div className="button-area">
        <button>
          <i className="fi fi-rr-following"></i>
        </button>
        <button
          onClick={() => {
            setDoState(true);
          }}
        >
          <i className="fi fi-rr-donate"></i>
        </button>
        <button>
          <i className="fi fi-rr-menu-dots"></i>
        </button>
      </div>
    </div>
  );
}
