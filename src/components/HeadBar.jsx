export default function HeadBar({navState, handleNavClick, displayText, handleBtnClick, buttonIcon}) {

  return (
    <div className="head-bar">
      <button
        className={`menu-toggle ${navState ? "active" : ""}`}
        onClick={handleNavClick}
      >
        <span />
        <span />
        <span />
      </button>
      <p>{displayText}</p>
      <button onClick={handleBtnClick}>
        {buttonIcon}
      </button>
    </div>
  );
}
