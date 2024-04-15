import { useState } from "react";

export default function LangBar({ language, setLanguage }) {
  const [isListVisible, setListVisible] = useState(false);
  const languageOptions = ["EN", "CN", "JP", "FR"];

  function handleLanguageSelect(language) {
    setLanguage(language);
    setListVisible(false);
  }

  return (
    <div className="lang-bar">
      <button onClick={() => setListVisible(!isListVisible)}>{language}</button>

      <ul
        style={{ display: isListVisible ? "" : "none" }}
        className="lang-selector"
      >
        {languageOptions.map((language) => (
          <li key={language} onClick={() => handleLanguageSelect(language)}>
            {language}
          </li>
        ))}
      </ul>
    </div>
  );
}
