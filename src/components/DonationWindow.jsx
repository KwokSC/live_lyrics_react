import { useRef, useState } from "react";
import { useGlobalError } from "../components/GlobalErrorContext.jsx";
import CardPayment from "./CardPayment.jsx";
import ApplePayment from "./ApplePayment.jsx";
import AliPayment from "./AliPayment.jsx";

export default function DonationWindow({ doState, setDoState }) {
  const [donationAmount, setAmount] = useState(0);
  const [amountSelected, setAmountSelected] = useState("");
  const [currentPage, setPage] = useState("SELECTION");
  const GlobalErrorContext = useRef(useGlobalError());

  function closeTipWindow() {
    setDoState(false);
    setPage("SELECTION");
    setAmount(0);
    setAmountSelected("");
  }

  function handleChangeAmount(type, amount) {
    setAmountSelected(type);
    if (amount) {
      setAmount(amount);
    }
  }

  function validateAmountAndJump(page) {
    if (parseInt(donationAmount) > 0) {
      setPage(page);
    } else {
      GlobalErrorContext.current.addErrorMsg(
        "Please enter a valid donation amount."
      );
    }
  }

  return (
    <div className={`donation-window ${doState ? "" : "hidden"}`}>
      <button
        style={{
          position: "absolute",
          aspectRatio: "1",
          width: "40px",
          top: "0",
          left: "0",
          boxShadow: "none",
        }}
        onClick={
          currentPage === "SELECTION"
            ? () => {
                closeTipWindow();
              }
            : () => {
                setPage("SELECTION");
              }
        }
      >
        {currentPage === "SELECTION" ? (
          <i className="fi fi-rr-cross"></i>
        ) : (
          <i className="fi fi-rr-angle-left"></i>
        )}
      </button>
      <div
        className="tip-container"
        style={{ display: currentPage === "SELECTION" ? "" : "none" }}
      >
        <p>Thanks for your support</p>
        <div className="amount-selection">
          <button
            className={
              amountSelected === "button" && donationAmount === 500
                ? "focus"
                : ""
            }
            onClick={() => handleChangeAmount("button", 500)}
          >
            <i className="fi fi-rr-usd-circle"></i>5
          </button>
          <button
            className={
              amountSelected === "button" && donationAmount === 1000
                ? "focus"
                : ""
            }
            onClick={() => handleChangeAmount("button", 1000)}
          >
            <i className="fi fi-rr-usd-circle"></i>
            10
          </button>
          <input
            id="custom-tip"
            className={amountSelected === "input" ? "focus" : ""}
            type="number"
            onClick={(e) => {
              setAmount(parseInt(e.target.value));
              handleChangeAmount("input");
            }}
            onChange={(e) => setAmount(parseInt(e.target.value) * 100)}
          />
        </div>
        <div className="payment-type-btn">
          <button onClick={() => validateAmountAndJump("CARD")}>
            <i className="fi fi-rr-credit-card"></i>
          </button>
          <button
            style={{ fontSize: "35px" }}
            onClick={() => validateAmountAndJump("APPLEPAY")}
          >
            <i className="fi fi-brands-apple-pay"></i>
          </button>
          <button
            style={{ fontSize: "25px" }}
            onClick={() => validateAmountAndJump("ALIPAY")}
          >
            <i className="fa-brands fa-alipay"></i>
          </button>
        </div>
      </div>
      <CardPayment
        currentPage={currentPage}
        money={donationAmount}
        closeTipWindow={closeTipWindow}
      />
      <ApplePayment currentPage={currentPage} money={donationAmount} />
      <AliPayment currentPage={currentPage} money={donationAmount} />
    </div>
  );
}
