import { useState } from "react";
import { useGlobalError } from "./GlobalErrorContext.jsx";

export default function RegisterWindow({ isOpen, setIsOpen }) {
  const [userAccount, setAccount] = useState("");
  const [userPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const { addErrorMsg } = useGlobalError();

  return (
    <form className="register-form" style={{ display: isOpen ? "" : "none" }}>
      <button type="button" onClick={() => setIsOpen(false)}>
        <i className="fi fi-rr-cross"></i>
      </button>
      <h1>Register</h1>
      <input
        type="account"
        placeholder="Account"
        value={userAccount}
        onChange={(e) => setAccount(e.target.value)}
      ></input>
      <input
        type="password"
        placeholder="Password"
        value={userPassword}
        onChange={(e) => setPassword(e.target.value)}
      ></input>
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      ></input>
      <input
        type="text"
        placeholder="Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      ></input>
      <button type="submit">Register</button>
    </form>
  );
}
