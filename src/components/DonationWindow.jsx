import { useEffect, useRef, useState } from "react";
import { useGlobalError } from "../components/GlobalErrorContext.jsx";
import TipSelection from "./TipSelection.jsx";
import CardPayment from "./CardPayment.jsx";
import ApplePayment from "./ApplePayment.jsx";
import AliPayment from "./AliPayment.jsx";

export default function DonationWindow({ doState, setDoState }) {
  const [donationAmount, setAmount] = useState(0);
  const [amountSelected, setAmountSelected] = useState("");
  const [currentPage, setPage] = useState("SELECTION");
  const GlobalErrorContext = useRef(useGlobalError());

  function display(currentPage) {
    if (currentPage === "SELECTION") {
      return (
        <TipSelection
          donationAmount={donationAmount}
          amountSelected={amountSelected}
          handleChangeAmount={handleChangeAmount}
          validateAmountAndJump={validateAmountAndJump}
        />
      );
    }
    if (currentPage === "CARD") {
      return (
        <CardPayment
          money={donationAmount}
          closeTipWindow={closeTipWindow}
        />
      );
    }
    if (currentPage === "APPLEPAY") {
      return <ApplePayment money={donationAmount} />;
    }
    if (currentPage === "ALIPAY") {
      return <AliPayment money={money} />;
    }
  }

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

  useEffect(() => {
    const scriptSrc = process.env.REACT_APP_SQUARE_ENDPOINT;
    const scriptElement = document.createElement("script");
    scriptElement.src = scriptSrc;
    document.body.appendChild(scriptElement);
  }, []);

  return (
    <div className="donation-window">
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
      {display(currentPage)}
    </div>
  );
}
