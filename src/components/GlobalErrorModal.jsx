import React from "react";
import { useGlobalError } from "./GlobalErrorContext";

export default function GlobalErrorModal(){
  const { errors, clearError } = useGlobalError();

  return (
    <div className="error-area">
      {errors.map((error, index) => (
        <div key={index} className="error-content">
          <p>{error}</p>
          <button onClick={() => clearError(error)}>Dismiss</button>
        </div>
      ))}
    </div>
  );
};
