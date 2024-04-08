export default function HostInfo({
  hoState,
  setDoState,
  profileImg,
  hostName,
  summary
}) {
  return (
    <div className={`host-info ${hoState ? "active" : "hidden"}`}>
      <img src={profileImg}></img>
      <p style={{fontSize:"20px"}}>{hostName}</p>
      <p >{summary}</p>
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
          <i class="fi fi-rr-menu-dots"></i>
        </button>
      </div>
    </div>
  );
}
