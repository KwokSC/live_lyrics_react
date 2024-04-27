import { useRef, useState, useEffect } from "react";
import { useGlobalError } from "./GlobalErrorContext";

export default function ApplePayment({ currentPage, money }) {
  const { addErrorMsg } = useGlobalError();
  const statusContainerRef = useRef();
  const payButtonRef = useRef();
  const [applePay, setApplePay] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  function buildPaymentRequest(payments) {
    return payments.paymentRequest({
      countryCode: "AU",
      currencyCode: "AUD",
      total: {
        amount: money.toString(),
        label: "Total",
      },
    });
  }

  async function handlePaymentMethodSubmission(event) {
    event.preventDefault();

    try {
      // disable the submit button as we await tokenization and make a payment request.
      payButtonRef.current.disabled = true;
      setIsProcessing(true)
      const token = await tokenize(applePay);
      const paymentResults = await createPayment(token);
      displayPaymentResults("SUCCESS");

      console.debug("Payment Success", paymentResults);
    } catch (e) {
      addErrorMsg("Fail to create payment, please try again.");
      setTimeout(() => {
        setIsProcessing(false)
        payButtonRef.current.disabled = false;
      }, 3000);
      displayPaymentResults("FAILURE");
      console.error(e.message);
    }
  }

  async function initializeApplePay(payments) {
    const paymentRequest = buildPaymentRequest(payments);
    const applePay = await payments.applePay(paymentRequest);
    return applePay;
  }

  async function createPayment(token) {
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
          setIsProcessing(false)
          return response.data.data;
        } else {
          throw new Error(response.data.data);
        }
      })
      .catch((error) => {
        addErrorMsg("Fail to create payment, please try again.");
        setTimeout(() => {
          setIsProcessing(false)
          payButtonRef.current.disabled = false;
        }, 3000);
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
      } catch {
        const statusContainer = statusContainerRef.current;
        statusContainer.className = "missing-credentials";
        statusContainer.style.visibility = "visible";
        return;
      }
      try {
        const applePay = await initializeApplePay(payments);
        setApplePay(applePay);
      } catch (e) {
        console.error("Initializing Apple Pay failed", e);
        // There are a number of reason why Apple Pay may not be supported
        // (e.g. Browser Support, Device Support, Account). Therefore you should handle
        // initialization failures, while still loading other applicable payment methods.
      }
    }
    initializeSquare();
  }, []);

  return (
    <div
      className="tip-container"
      style={{ display: currentPage === "APPLEPAY" ? "" : "none" }}
    >
      <div
        className="apple-pay-button"
        ref={payButtonRef}
        onClick={handlePaymentMethodSubmission}
      >
        {isProcessing ? (
          <div className="loading-spinner" />
        ) : (
          <i className="fi fi-brands-apple-pay"></i>
        )}
      </div>
      <div ref={statusContainerRef}></div>
    </div>
  );
}
