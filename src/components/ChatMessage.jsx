export default function ChatMessage({ message }) {
  return (
    <div className="chat-message">
      <p>{"@" + message.sender + ": "}</p>
      <p>{message.content}</p>
    </div>
  );
}
