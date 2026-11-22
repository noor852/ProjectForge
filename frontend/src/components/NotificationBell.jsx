import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api";

// how long ago the notification came
function timeAgo(dateText) {
  const seconds = Math.floor((Date.now() - new Date(dateText).getTime()) / 1000);
  if (seconds < 60) {
    return "just now";
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes + " min ago";
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + " hr ago";
  }
  return Math.floor(hours / 24) + " day(s) ago";
}

// Feature 10: bell icon with the number of unread invitations / requests (like Facebook)
function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  function loadNotifications() {
    request("/api/notifications")
      .then(function (data) {
        setNotifications(data.notifications);
        setUnread(data.unread);
      })
      .catch(function () {
        // ignore, the next check will try again
      });
  }

  // check for new notifications now and then every 5 seconds, clear the timer when the bell goes away
  useEffect(function () {
    loadNotifications();
    const timer = setInterval(loadNotifications, 5000);
    return function () {
      clearInterval(timer);
    };
  }, []);

  // open one notification: mark it as read and go to the right page
  function handleOpen(n) {
    setOpen(false);
    request("/api/notifications/" + n._id, "PUT").then(loadNotifications);

    if (n.type === "invite" || n.type === "request") {
      navigate("/requests");
    } else if (n.project) {
      navigate("/project/" + n.project);
    }
  }

  function handleMarkAll() {
    request("/api/notifications/read-all", "PUT").then(loadNotifications);
  }

  return (
    <div className="bell-wrap">
      <button
        type="button"
        className="bell-btn"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={function () {
          setOpen(!open);
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className="bell-badge">{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div className="notif-menu">
          <div className="notif-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="notif-markall" onClick={handleMarkAll}>
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 && <p className="notif-empty">No notifications yet.</p>}

          {notifications.map(function (n) {
            return (
              <button
                type="button"
                key={n._id}
                className={n.read ? "notif-item" : "notif-item notif-unread"}
                onClick={function () {
                  handleOpen(n);
                }}
              >
                <span>{n.message}</span>
                <small>{timeAgo(n.createdAt)}</small>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;