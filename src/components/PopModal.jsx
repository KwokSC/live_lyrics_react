import { Fragment } from "react";
import { createPortal } from "react-dom";

export default function PopModal({
  modalIsOpen,
  confirmAction,
  closeModal,
  displayText
}) {
  return createPortal(
    <Fragment>
      <div
        className="pop-modal"
        style={{ display: modalIsOpen ? "" : "none" }}
      >
        <p>{displayText}</p>
        <button onClick={confirmAction}>Yes</button>
        <button onClick={closeModal}>Cancel</button>
      </div>
      <div
        className="overlay"
        style={{ display: modalIsOpen ? "" : "none" }}
        onClick={closeModal}
      ></div>
    </Fragment>,
    document.getElementById("root")
  );
}
