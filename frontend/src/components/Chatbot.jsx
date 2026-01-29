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

    const userText = input; 
    setInput("");

    // 🆕 GET USER CONTEXT
    const userEmail = localStorage.getItem("email");

    try {
      // 2. Send to Backend WITH Email
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userText,
          userEmail: userEmail // 👈 Vital for "Memory"
        }),
      });

      const data = await response.json();

      const botMsg = {
        sender: "bot",
        text: data.reply 
      };
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg = { sender: "bot", text: "⚠️ Error connecting to AI server." };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <div className={`chatbot-container ${open ? "open" : ""}`}>
      {/* HEADER */}
      <div className="chatbot-header" onClick={() => setOpen(!open)}>
        {open ? (
          <div className="chatbot-title">
            <span className="bot-avatar">🤖</span>
            <span>MediBot</span>
          </div>
        ) : (
          <>
            <span>🤖</span>
            <span>Ask AI</span>
          </>
        )}
        {open && (
          <span className="chatbot-close" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>✕</span>
        )}
      </div>

      {open && (
        <div className="chatbot-body">
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginTop: "100px" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>👋</div>
                <p>Hi! I'm MediBot.</p>
                <p style={{ fontSize: "0.9em" }}>I can read your records. Ask me: <br/><i>"How is my health trending?"</i></p>
              </div>
            )}
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
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your health..."
            />
            <button onClick={sendMessage} disabled={!input.trim()}>🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;