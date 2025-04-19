import { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";
import { useSocket } from "../../contexts/SocketContext"; 

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const { pickupNotifications } = useSocket();

  // Initial fetch
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/notifications`
        );
        const notificationsWithPickupDetails = await Promise.all(
          res.data.map(async (notification) => {
            const transactionRes = await axios.get(
              `${
                import.meta.env.VITE_API_BASE_URL
              }/api/transactions/getTransaction/${notification.transactionId}`
            );
            return {
              ...notification,
              pickupDetails: transactionRes.data.transaction.pickupDetails,
            };
          })
        );
        setNotifications(notificationsWithPickupDetails);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
  }, []);

  // Real-time updates from pickupNotifications
  useEffect(() => {
    const fetchPickupDetailsAndAppend = async () => {
      for (const incoming of pickupNotifications) {
        try {
          const transactionRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/transactions/getTransaction/${incoming.transactionId}`
          );

          const newNotification = {
            ...incoming,
            pickupDetails: transactionRes.data.transaction.pickupDetails,
          };

          setNotifications((prev) => [newNotification, ...prev]);
        } catch (error) {
          console.error("Failed to fetch pickupDetails for real-time notification", error);
        }
      }
    };

    if (pickupNotifications.length > 0) {
      fetchPickupDetailsAndAppend();
    }
  }, [pickupNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notificationId}/read`,
        { status: "read" }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "read" } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleAcceptPickup = async (transactionId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/transactions/respondToPickup/${transactionId}`,
        { response: "accepted" }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.transactionId === transactionId
            ? {
                ...n,
                message: "Pickup proposal accepted",
                status: "read",
                pickupDetails: {
                  ...n.pickupDetails,
                  status: "accepted",
                },
              }
            : n
        )
      );
    } catch (error) {
      console.error("Failed to accept pickup", error);
    }
  };

  const handleRejectPickup = async (transactionId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/transactions/respondToPickup/${transactionId}`,
        { response: "rejected" }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.transactionId === transactionId
            ? {
                ...n,
                message: "Pickup proposal rejected",
                status: "read",
                pickupDetails: {
                  ...n.pickupDetails,
                  status: "rejected",
                },
              }
            : n
        )
      );
    } catch (error) {
      console.error("Failed to reject pickup", error);
    }
  };

  return (
    <div className="notifications-container">
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification._id || notification.transactionId} className="notification-card">
            <p>{notification.message}</p>
            <small>{new Date(notification.createdAt || Date.now()).toLocaleString()}</small>

            {notification.pickupDetails &&
              notification.pickupDetails.status === "pending" && (
                <div className="pickup-details">
                  <p>
                    <strong>Pickup Location:</strong>{" "}
                    {notification.pickupDetails.location.address}
                  </p>
                  <p>
                    <strong>Pickup Date:</strong>{" "}
                    {new Date(notification.pickupDetails.pickupDateTime).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleAcceptPickup(notification.transactionId)}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectPickup(notification.transactionId)}
                  >
                    Reject
                  </button>
                </div>
              )}

            {notification.pickupDetails?.status !== "pending" && (
              <div className="pickup-details">
                <p>
                  <strong>Pickup Status:</strong>{" "}
                  {notification.pickupDetails.status}
                </p>
                <p>
                  <strong>Pickup Location:</strong>{" "}
                  {notification.pickupDetails.location.address}
                </p>
              </div>
            )}

            {notification.status === "pending" && (
              <button
                className="mark-read-btn"
                onClick={() => handleMarkAsRead(notification._id)}
              >
                Mark as Read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;
