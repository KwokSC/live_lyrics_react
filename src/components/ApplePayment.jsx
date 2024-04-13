import { useRef } from "react";

export default function ApplePayment({ currentPage, money }) {
  const appleContainerRef = useRef();
  const statusContainerRef = useRef();

  return (
    <div
      className="tip-container"
      style={{ display: currentPage === "APPLEPAY" ? "" : "none" }}
    >
      <div ref={appleContainerRef} id="apple-container"></div>

      <div ref={statusContainerRef}></div>
    </div>
  );
}
