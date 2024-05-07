import { useState, useRef, useEffect } from "react";
import base from "../requests/base.jsx";
import { useGlobalError } from "./GlobalErrorContext.jsx";

export default function CardPayment({ money, closeTipWindow }) {
  const { addErrorMsg } = useGlobalError();
  const [card, setCard] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cardContainerRef = useRef();
  const buttonContainerRef = useRef();
  const payButtonRef = useRef();
  const statusContainerRef = useRef();

  async function handlePaymentMethodSubmission(event) {
    event.preventDefault();

    const token = await tokenize(card);
    const paymentResults = await createPayment(token);
  }

  async function initializeCard(payments) {
    const card = await payments.card();
    cardContainerRef.current.innerHTML = "";
    await card.attach("#card-container");
    return card;
  }

  async function createPayment(token) {
    // disable the submit button as we await tokenization and make a payment request.
    payButtonRef.current.disabled = true;
    setIsProcessing(true);
    base
      .post("/tip/payment", {
        locationId: process.env.REACT_APP_SQUARE_LOCATION_ID,
        sourceId: token,
        idempotencyKey: window.crypto.randomUUID(),
        amountMoney: {
          amount: money,
          currency: "AUD",
        },
      })
      .then((response) => {
        if (response.status === 200) {
          displayPaymentResults("SUCCESS");
          return response.data.data;
        } else {
          throw new Error(response.data.data);
        }
      })
      .catch((error) => {
        addErrorMsg("Fail to create payment, please try again.");
        displayPaymentResults("FAILURE");
        console.error(error);
      });
  }

  async function tokenize(paymentMethod) {
    const tokenResult = await paymentMethod.tokenize();
    if (tokenResult.status === "OK") {
      return tokenResult.token;
    } else {
      let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
      if (tokenResult.errors) {
        errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
      }
      throw new Error(errorMessage);
    }
  }

  function broadcastDonation(){
    
  }

  // status is either SUCCESS or FAILURE;
  function displayPaymentResults(status) {
    const statusContainer = statusContainerRef.current;
    if (status === "SUCCESS") {
      cardContainerRef.current.style.display = "none";
      buttonContainerRef.current.style.display = "none";
      statusContainer.style.display = "";
      statusContainer.classList.remove("is-failure");
      statusContainer.classList.add("is-success");
      setIsProcessing(false);
      setTimeout(() => {
        closeTipWindow()
      }, 3000);
    } else {
      statusContainer.classList.remove("is-success");
      statusContainer.classList.add("is-failure");
      setTimeout(() => {
        payButtonRef.current.disabled = false;
        setIsProcessing(false);
      }, 3000);
    }

    statusContainer.style.visibility = "visible";
  }

  useEffect(() => {
    async function initializeSquare() {
      if (!window.Square) {
        throw new Error("Square.js failed to load properly");
      }

      const appId = process.env.REACT_APP_SQUARE_APP_ID;
      const locationId = process.env.REACT_APP_SQUARE_LOCATION_ID;

      let payments;
      try {
        payments = window.Square.payments(appId, locationId);
      } catch {
        const statusContainer = statusContainerRef.current;
        statusContainer.style.display = "";
        statusContainer.className = "missing-credentials";
        statusContainer.style.visibility = "visible";
        addErrorMsg("Payment not available now. Please try again.");
        return;
      }

      try {
        const card = await initializeCard(payments);
        setCard(card);
      } catch (e) {
        console.error("Initializing Card failed", e);
        return;
      }
    }
    initializeSquare();
  }, []);

  return (
    <div className="tip-container">
      <div ref={cardContainerRef} id="card-container"></div>
      <div className="donation-button-container" ref={buttonContainerRef}>
        <button ref={payButtonRef} onClick={handlePaymentMethodSubmission}>
          {isProcessing ? <div className="loading-spinner"></div> : "Confirm"}
        </button>
        <button
          onClick={() => {
            closeTipWindow();
          }}
        >
          Cancel
        </button>
      </div>
      <div
        className="payment-status-container"
        ref={statusContainerRef}
        style={{ display: "none" }}
      />
    </div>
  );
}
