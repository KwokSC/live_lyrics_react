export default function HostInfo({
  hoState,
  setDoState,
  profileImg,
  hostName,
  summary,
  instagram,
  tiktok,
}) {
  return (
    <div className={`host-info ${hoState ? "active" : "hidden"}`}>
      <img src={profileImg}></img>
      <p style={{ textTransform: "capitalize", fontSize: "20px" }}>
        {hostName}
      </p>
      <div className="social-media">
        <a
          href={"https://www.instagram.com/" + instagram}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fi fi-brands-instagram"></i>
        </a>
        <a>
          <i className="fi fi-brands-twitter-alt-circle"></i>
        </a>
        <a
          href={"https://www.tiktok.com/@" + tiktok}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fi fi-brands-tik-tok"></i>
        </a>
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
