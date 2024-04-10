import { useEffect, useState, useRef } from "react";
import BulletScreen from "rc-bullets-ts";
import ChatMessage from "./ChatMessage";

export default function DanmuScreen({ messages }) {
  const screenElRef = useRef();
  const screenRef = useRef();

  useEffect(() => {
    screenRef.current = new BulletScreen(screenElRef.current, { duration: 10 });
  }, []);

  useEffect(() => {
    if (messages && screenRef.current) {
      const newMsg = messages[messages.length - 1];
      if (newMsg) {
        screenRef.current.push(<ChatMessage message={newMsg} />);
      }
    }
  }, [messages]);

  return <div className="danmu-screen" ref={screenElRef}></div>;
}
