import { useEffect, useState } from "react";
import axios from "axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/notifications`
        );
        const notificationsWithPickupDetails = await Promise.all(
          res.data.map(async (notification) => {
            const transactionRes = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/transactions/getTransaction/${notification.transactionId}`
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notificationId}/read`,
        { status: "read" }
      );
      setNotifications(notifications.map(notification =>
        notification._id === notificationId ? { ...notification, status: "read" } : notification
      ));
    } catch (error) {
      console.error("Failed to update notification status", error);
    }
  };

  const handleAcceptPickup = async (transactionId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/transactions/respondToPickup/${transactionId}`,
        { response: "accepted" }
      );
      // Handle the response to update the UI accordingly
      setNotifications(notifications.map(notification =>
        notification.transactionId === transactionId ? {
          ...notification,
          message: "Pickup proposal accepted",
          status: "read",
        } : notification
      ));
    } catch (error) {
      console.error("Failed to accept pickup", error);
    }
  };

  const handleRejectPickup = async (transactionId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/transactions/respondToPickup/${transactionId}`,
        { response: "rejected" }
      );
      // Handle the response to update the UI accordingly
      setNotifications(notifications.map(notification =>
        notification.transactionId === transactionId ? {
          ...notification,
          message: "Pickup proposal rejected",
          status: "read",
        } : notification
      ));
    } catch (error) {
      console.error("Failed to reject pickup", error);
    }
  };

  return (
    <div>
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification._id}>
            <p>{notification.message}</p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
            {notification.pickupDetails && notification.pickupDetails.status === "pending" && (
              <div>
                <p><strong>Pickup Location:</strong> {notification.pickupDetails.location.address}</p>
                <p><strong>Pickup Date:</strong> {new Date(notification.pickupDetails.pickupDateTime).toLocaleString()}</p>
                <button onClick={() => handleAcceptPickup(notification.transactionId)}>
                  Accept
                </button>
                <button onClick={() => handleRejectPickup(notification.transactionId)}>
                  Reject
                </button>
              </div>
            )}
            {notification.status === "pending" && (
              <button onClick={() => handleMarkAsRead(notification._id)}>
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
