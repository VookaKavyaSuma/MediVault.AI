import Navbar from "../components/Navbar";
import "./../styles/Notifications.css";
import { useState } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Medical Record Uploaded",
      message: "Your blood test report was added successfully.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "AI Summary Ready",
      message: "Your medical report summary has been generated.",
      time: "Yesterday",
      read: true,
    },
    {
      id: 3,
      title: "QR Access Expiring",
      message: "Your shared QR access will expire in 5 minutes.",
      time: "Just now",
      read: false,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <div className="notifications-page">
      <Navbar />

      <div className="notifications-container">
        <h1>Notifications</h1>

        {notifications.length === 0 ? (
          <p className="empty">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.read ? "read" : "unread"}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="notification-text">
                <h4>{n.title}</h4>
                <p>{n.message}</p>
              </div>
              <span className="time">{n.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
