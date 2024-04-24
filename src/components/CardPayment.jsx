import { useState, useRef, useEffect } from "react";
import base from "../requests/base.jsx";
import { useGlobalError } from "./GlobalErrorContext.jsx";

export default function CardPayment({
  currentPage,
  money,
  setDoState,
  setCurrentPage,
}) {
  const {addErrorMsg} = useGlobalError()
  const [card, setCard] = useState(null);
  const [payments, setPayments] = useState(null);
  const cardContainerRef = useRef();
  const statusContainerRef = useRef();
  const payButtonRef = useRef();

  async function handlePaymentMethodSubmission(event) {
    event.preventDefault();

    try {
      // disable the submit button as we await tokenization and make a payment request.
      payButtonRef.current.disabled = true;
      const token = await tokenize(card);
      const verificationToken = await verifyBuyer(payments, token);
      const paymentResults = await createPayment(token, verificationToken);
      displayPaymentResults("SUCCESS");

      console.debug("Payment Success", paymentResults);
    } catch (e) {
      addErrorMsg("Fail to create payment, please try again.")
      setTimeout(() => {
        payButtonRef.current.disabled = false;
      }, 3000);
      displayPaymentResults("FAILURE");
      console.error(e.message);
    }
  }

  async function initializeCard(payments) {
    const card = await payments.card();
    cardContainerRef.current.innerHTML = "";
    await card.attach("#card-container");

    return card;
  }

  async function createPayment(token, verificationToken) {
    base
      .post("/tip/payment", {
        locationId: process.env.REACT_APP_SQUARE_LOCATION_ID,
        sourceId: token,
        verificationToken,
        idempotencyKey: window.crypto.randomUUID(),
        amountMoney: {
          amount: money,
          currency: "AUD",
        },
      })
      .then((response) => {
        if (response.status === 200) {
          return response.data.data;
        } else {
          throw new Error(response.data.data);
        }
      })
      .catch((error) => {
        addErrorMsg("Fail to create payment, please try again.")
        setTimeout(() => {
          payButtonRef.current.disabled = false;
        }, 1000);
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

  // Required in SCA Mandated Regions: Learn more at https://developer.squareup.com/docs/sca-overview
  async function verifyBuyer(payments, token) {
    const verificationDetails = {
      amount: "1.00",
      billingContact: {
        givenName: "John",
        familyName: "Doe",
        email: "john.doe@square.example",
        phone: "3214563987",
        addressLines: ["123 Main Street", "Apartment 1"],
        city: "London",
        state: "LND",
        countryCode: "GB",
      },
      currencyCode: "GBP",
      intent: "CHARGE",
    };

    const verificationResults = await payments.verifyBuyer(
      token,
      verificationDetails
    );
    return verificationResults.token;
  }

  // status is either SUCCESS or FAILURE;
  function displayPaymentResults(status) {
    const statusContainer = statusContainerRef.current;
    if (status === "SUCCESS") {
      statusContainer.classList.remove("is-failure");
      statusContainer.classList.add("is-success");
    } else {
      statusContainer.classList.remove("is-success");
      statusContainer.classList.add("is-failure");
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
        setPayments(payments);
      } catch {
        const statusContainer = statusContainerRef.current;
        statusContainer.className = "missing-credentials";
        statusContainer.style.visibility = "visible";
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
    <div
      className="tip-container"
      style={{ display: currentPage === "CARD" ? "" : "none" }}
    >
      <div ref={cardContainerRef} id="card-container"></div>
      <div className="donation-button-container">
        <button ref={payButtonRef} onClick={handlePaymentMethodSubmission}>
          Confirm
        </button>
        <button
          onClick={() => {
            setDoState(false);
            setCurrentPage("SELECTION");
          }}
        >
          Cancel
        </button>
      </div>
      <div ref={statusContainerRef}></div>
    </div>
  );
}
