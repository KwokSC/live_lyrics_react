import { useState } from "react";
import "./LoginPage.scss";
import { useGlobalError } from "../components/GlobalErrorContext.jsx";
import base from "../requests/base.jsx";
import { setAuthToken, storeUserInfo } from "../utils/cookie.jsx";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [userAccount, setAccount] = useState("");
  const [userPassword, setPassword] = useState("");
  const { addErrorMsg } = useGlobalError();
  const navigate = useNavigate();

  function handleLogin(event) {
    event.preventDefault();
    if (validateLogin()) {
      base
        .post("/user/login", {
          userAccount: userAccount,
          userPassword: userPassword,
        })
        .then((response) => {
          if (response.data.code === 200) {
            setAuthToken(response.data.data.auth);
            storeUserInfo(response.data.data.userInfo);
            navigate("/console");
          }
          if (response.data.code === 401) {
            addErrorMsg("Wrong account or password, please try again.");
          }
        })
        .catch((error) => {
          console.error(error);
          addErrorMsg(
            "Sorry the server encounter some issue, please try later"
          );
        });
    } else {
      addErrorMsg("The login information shouldn't be empty.");
    }
  }

  function validateLogin() {
    return !(userAccount.trim() === "" || userPassword.trim() === "");
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>login</h1>
        <input
          type="account"
          placeholder="Account"
          value={userAccount}
          onChange={(e) => setAccount(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={userPassword}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
