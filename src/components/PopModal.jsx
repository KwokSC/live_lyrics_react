import { Fragment } from "react";
import { createPortal } from "react-dom";

export default function PopModal({ content }) {
  return createPortal(
    <Fragment>{content}</Fragment>,
    document.getElementById("root")
  );
}
