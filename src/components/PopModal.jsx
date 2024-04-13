import { Fragment } from "react";
import { createPortal } from "react-dom";
import Overlay from "./Overlay";

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
      <Overlay isCovered={modalIsOpen} onClick={closeModal} />
    </Fragment>,
    document.getElementById("root")
  );
}
