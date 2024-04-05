import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { GlobalErrorProvider } from "./components/GlobalErrorContext";
import GlobalErrorModal from "./components/GlobalErrorModal";

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <GlobalErrorProvider>
    <GlobalErrorModal />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GlobalErrorProvider>
  // </React.StrictMode>
);
