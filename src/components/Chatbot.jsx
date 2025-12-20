import { useState } from "react";
import "./../styles/Chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages([...messages, userMsg]);

    // Mock AI response
    setTimeout(() => {
      const botMsg = {
        sender: "bot",
        text: "This is a mock response. AI summary and medical guidance can appear here."
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);

    setInput("");
  };

  return (
    <div className={`chatbot-container ${open ? "open" : ""}`}>
      <div className="chatbot-header">
        <span onClick={() => setOpen(!open)}>🤖 Chat</span>

        {open && (
          <span
            className="chatbot-close"
            onClick={() => setOpen(false)}
          >
            ❌
          </span>
        )}
      </div>


      {open && (
        <div className="chatbot-body">
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.sender}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
