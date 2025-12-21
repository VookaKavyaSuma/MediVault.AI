import Navbar from "../components/Navbar";
import "./../styles/Notifications.css";
import { useState, useEffect } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  // 1. Fetch Real Notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // 2. Mark as Read
  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PUT" });
      
      // Update UI instantly
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  return (
    <div className="notifications-page">
      <Navbar />
      <div className="notifications-container">
        <h1>Notifications</h1>

        {notifications.length === 0 ? (
          <p className="empty">No new notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`notification-card ${n.read ? "read" : "unread"}`}
              onClick={() => markAsRead(n._id)}
            >
              <div className="notification-text">
                <h4>{n.title}</h4>
                <p>{n.message}</p>
              </div>
              <span className="time">
                {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;