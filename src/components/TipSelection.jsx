export default function TipSelection({
  donationAmount,
  amountSelected,
  handleChangeAmount,
  validateAmountAndJump,
}) {
  return (
    <div className="tip-container">
      <p>Thanks for your support</p>
      <div className="amount-selection">
        <button
          className={
            amountSelected === "button" && donationAmount === 500 ? "focus" : ""
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
          onClick={(e) =>
            handleChangeAmount("input", parseInt(e.target.value) * 100)
          }
          onChange={(e) =>
            handleChangeAmount("input", parseInt(e.target.value) * 100)
          }
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
  );
}
