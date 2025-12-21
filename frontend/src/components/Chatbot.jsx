import { useState } from "react";
import "./../styles/Chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Show User Message immediately
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    
    const userText = input; // Save text before clearing
    setInput(""); 

    try {
      // 2. Send to Backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      // 3. Show Bot Response
      const botMsg = {
        sender: "bot",
        text: data.reply // This comes from your server.js logic!
      };
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      const errorMsg = { sender: "bot", text: "⚠️ Error connecting to AI server." };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <div className={`chatbot-container ${open ? "open" : ""}`}>
      <div className="chatbot-header">
        <span onClick={() => setOpen(!open)}>🤖</span>

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
            <button onClick={sendMessage}>🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
