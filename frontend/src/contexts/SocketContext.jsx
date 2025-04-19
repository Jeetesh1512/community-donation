import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [pickupNotifications, setPickupNotifications] = useState([]);

  // Connect and join room when user is authenticated
  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("joinRoom", user._id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  // Handle general notification
  useEffect(() => {
    if (!socket) return;

    const handleGeneralNotification = (data) => {
      setPickupNotifications((prev) => {
        if (prev.some((n) => n._id === data._id)) return prev;
        return [...prev, data];
      });
    };

    socket.on("notification", handleGeneralNotification);

    return () => {
      socket.off("notification", handleGeneralNotification);
    };
  }, [socket]);

  // Handle pickup proposal notification
  useEffect(() => {
    if (!socket) return;

    const handlePickupProposal = (data) => {
      setPickupNotifications((prev) => {
        if (prev.some((n) => n._id === data._id)) return prev;
        return [...prev, data];
      });

      console.log(
        `📦 New pickup proposed:\n📍 ${data.location?.address}\n📅 ${new Date(
          data.pickupDateTime
        ).toLocaleString()}`
      );
    };

    socket.on("pickupProposalNotification", handlePickupProposal);

    return () => {
      socket.off("pickupProposalNotification", handlePickupProposal);
    };
  }, [socket]);

  // Utility: join a room manually (optional)
  const joinRoom = useCallback(
    (roomId) => {
      if (socket) {
        socket.emit("joinRoom", roomId);
        console.log(`Manually joined room: ${roomId}`);
      }
    },
    [socket]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        pickupNotifications,
        setPickupNotifications,
        joinRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
