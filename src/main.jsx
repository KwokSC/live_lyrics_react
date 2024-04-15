import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { GlobalErrorProvider } from "./components/GlobalErrorContext";
import { PlayerContextProvider } from "./components/PlayerContext";
import GlobalErrorModal from "./components/GlobalErrorModal";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <GlobalErrorProvider>
    <PlayerContextProvider>
      <GlobalErrorModal />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PlayerContextProvider>
  </GlobalErrorProvider>
  // </React.StrictMode>
);
