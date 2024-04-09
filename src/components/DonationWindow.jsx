import { useRef, useState } from "react";
import { useMask } from "@react-input/mask";
import { useGlobalError } from "../components/GlobalErrorContext.jsx";

export default function DonationWindow({ doState, setDoState }) {
  const cardMaskRef = useMask({
    mask: "____ ____ ____ ____",
    replacement: { _: /\d/ },
  });
  const expirtyMaskRef = useMask({ mask: "__/__", replacement: { _: /\d/ } });
  const cvvMaskRef = useMask({ mask: "___", replacement: { _: /\d/ } });
  const [donationAmount, setAmount] = useState(0);
  const [amountSelected, setAmountSelected] = useState(null);
  const [cardholderName, setName] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState(0);
  const [currentPage, setPage] = useState(0);
  const GlobalErrorContext = useRef(useGlobalError());

  function handleChangeAmount(type, amount) {
    setAmountSelected(type);
    if (amount) {
      setAmount(amount);
    }
  }

  function validateAmountAndJump(page){
    if (parseInt(donationAmount) > 0) {
      setPage(page);
    } else {
      GlobalErrorContext.current.addErrorMsg(
        "Please enter a valid donation amount."
      );
    }
  }

  function donate() {
    const expMonth = expiry.split("/")[0];
    const expYear = expiry.split("/")[1];
    const cardNumber = card.replace(/\s/g, "");

    const cardInfo = {
      cardholderName: cardholderName,
      cardNumer: cardNumber,
      expMonth: expMonth,
      expYear: expYear,
      cvv: cvv,
    };
  }

  const buttonContainer = (
    <div className="donation-button-container">
      <button>Confirm</button>
      <button
        onClick={() => {
          setDoState(false);
        }}
      >
        Cancel
      </button>
    </div>
  );

  const pages = [
    {
      title: "Amount Page",
      content: (
        <>
          <p>Thanks for your support</p>
          <div className="amount-selection">
            <button
              className={
                amountSelected === "button" && donationAmount === 5
                  ? "focus"
                  : ""
              }
              onClick={() => handleChangeAmount("button", 5)}
            >
              $5
            </button>
            <button
              className={
                amountSelected === "button" && donationAmount === 10
                  ? "focus"
                  : ""
              }
              onClick={() => handleChangeAmount("button", 10)}
            >
              $10
            </button>
            <input
              className={amountSelected === "input" ? "focus" : ""}
              type="number"
              onClick={(e) => {
                setAmount(parseInt(e.target.value));
                handleChangeAmount("input");
              }}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="payment-type-btn">
            <button
              onClick={()=>validateAmountAndJump(1)}
            >
              <i className="fi fi-rr-credit-card"></i>
            </button>
            <button
              style={{ fontSize: "35px" }}
              onClick={()=>validateAmountAndJump(2)}
            >
              <i className="fi fi-brands-apple-pay"></i>
            </button>
            <button
              onClick={()=>validateAmountAndJump(3)}
            >
              <i className="fi fi-brands-paypal"></i>
            </button>
          </div>
        </>
      ),
    },
    {
      title: "Card Payment Page",
      content: (
        <>
          <input
            placeholder="Card Holder Name"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <input
            ref={cardMaskRef}
            value={card}
            placeholder="Card Number"
            onChange={(e) => setCard(e.target.value)}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "80%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              style={{ marginRight: "5px" }}
              ref={expirtyMaskRef}
              placeholder="Expiry Date"
            />

            <input
              style={{ marginLeft: "5px" }}
              ref={cvvMaskRef}
              placeholder="CVV"
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>
          {buttonContainer}
        </>
      ),
    },
    {
      title: "Apple Payment Page",
      content: (
        <>
          <p>Waiting for confirmation...</p>
          <i className="fi fi-rr-loading" style={{ fontSize: "30px" }}></i>
        </>
      ),
    },
    {
      title: "Paypal Payment Page",
      content: (
        <>
          <p>Redirect to Paypal...</p>
          <i className="fi fi-rr-loading" style={{ fontSize: "30px" }}></i>
        </>
      ),
    },
    {
      title: "Thank You Page",
      content: (
        <>
          <p>The payment has been procceed, thanks!</p>
        </>
      ),
    },
  ];

  return (
    <div className={`donation-window ${doState ? "active" : "hidden"}`}>
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
          currentPage === 0
            ? () => {
                setDoState(false);
                setPage(0);
              }
            : () => {
                setPage(0);
              }
        }
      >
        {currentPage === 0 ? (
          <i className="fi fi-rr-cross"></i>
        ) : (
          <i className="fi fi-rr-angle-left"></i>
        )}
      </button>
      {pages[currentPage].content}
    </div>
  );
}
