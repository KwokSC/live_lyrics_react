import { useState } from "react";

export default function DonationWindow({ doState, setDoState }) {
  const [donationAmount, setAmount] = useState(0);
  const [cardholderName, setName] = useState("");
  const [cardNumer, setNumber] = useState("");
  const [expYear, setYear] = useState(0);
  const [expMonth, setMonth] = useState(0);
  const [cvv, setCvv] = useState(0);
  const [currentPage, setPage] = useState(0);

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
            <button className={"selected"}>$5</button>
            <button className={"selected"}>$10</button>
            <input
              inputMode="numeric"
              type="number"
              onChange={(e) => handleAmountChange(e.target.value)}
            />
          </div>
          <div className="payment-type-btn">
            <button
              onClick={() => {
                setPage(1);
              }}
            >
              <i className="fi fi-rr-credit-card"></i>
            </button>
            <button style={{ fontSize: "35px" }}>
              <i class="fi fi-brands-apple-pay"></i>
            </button>
            <button>
              <i class="fi fi-brands-paypal"></i>
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
            inputMode="text"
            placeholder="Card Holder Name"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <input
            inputMode="numeric"
            type="number"
            placeholder="Card Number"
            onChange={(e) => {
              setNumber(e.target.value);
            }}
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
            <span className="expiry-date-input">
              <input
                inputMode="numeric"
                type="number"
                name="month"
                placeholder="MM"
                maxLength={2}
                size={2}
                onChange={(e) => {
                  setMonth(e.target.value);
                }}
              />
              <span>/</span>
              <input
                inputMode="numeric"
                type="number"
                name="year"
                placeholder="YY"
                maxLength={2}
                size={2}
                onChange={(e) => {
                  setYear(e.target.value);
                }}
              />
            </span>
            <input
              style={{ flex: "1" }}
              inputMode="numeric"
              type="number"
              size={3}
              maxLength={3}
              placeholder="CVV"
              onChange={(e) => {
                setCvv(e.target.value);
              }}
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
        </>
      ),
    },
    {
      title: "Paypal Payment Page",
      content: (
        <>
          <p>Redirect to Paypal...</p>
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

  function handleAmountChange(amount) {
    setAmount(amount);
  }

  function donate() {
    const cardInfo = {
      cardholderName: cardholderName,
      cardNumer: cardNumer,
      expMonth: expMonth,
      expYear: expYear,
      cvv: cvv,
    };
  }

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
          display: currentPage == 0 ? "none" : "",
        }}
        onClick={() => {
          setPage(0);
        }}
      >
        <i class="fi fi-rr-angle-left"></i>
      </button>
      {pages[currentPage].content}
    </div>
  );
}
