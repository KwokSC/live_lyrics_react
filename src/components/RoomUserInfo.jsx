export default function RoomUserInfo({ user }) {
  return (
    <div className={`room-user-info ${user.type === "HOST" ? "host" : ""}`}>
      <div className="profile-img">
        {user.profileImg ? (
          <img src={user.profileImg} />
        ) : (
          <i className="fi fi-rr-circle-user" />
        )}
      </div>
      <p style={{ fontSize: "12px" }}>{user.userName}</p>
      <p style={{ fontSize: "10px", fontStyle: "italic", marginTop: "2px" }}>
        {"@" + user.userAccount}
      </p>
    </div>
  );
}
