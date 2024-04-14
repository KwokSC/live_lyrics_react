import React, { createContext, useContext, useState, useEffect } from "react";

const GlobalErrorContext = createContext({
  errors: [],
  addErrorMsg: undefined,
  clearError: undefined,
});

export const useGlobalError = () => {
  return useContext(GlobalErrorContext);
};

export const GlobalErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const addErrorMsg = (message) => {
    if (!errors.includes(message)) {
      setErrors((prevErrors) => [...prevErrors, message]);
    }
  };

  const clearError = (message) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error !== message));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (errors.length > 0) {
        errors.map((error) => clearError(error));
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [errors]);

  return (
    <GlobalErrorContext.Provider
      value={{
        errors: errors,
        addErrorMsg: addErrorMsg,
        clearError: clearError,
      }}
    >
      {children}
    </GlobalErrorContext.Provider>
  );
};
