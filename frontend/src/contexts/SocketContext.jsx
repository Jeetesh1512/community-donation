import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [pickupNotification, setPickupNotification] = useState(null);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", user._id);
      console.log("✅ Socket connected & room joined");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  const handlePickupProposal = useCallback((data) => {
    setPickupNotification(data); 
    toast.info(
      `📦 New pickup proposed!\n📍 ${data.location}\n📅 ${new Date(
        data.pickupDateTime
      ).toLocaleString()}`
    );
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket
      .off("pickupProposalNotification")
      .on("pickupProposalNotification", handlePickupProposal);

    return () => {
      socket.off("pickupProposalNotification", handlePickupProposal);
    };
  }, [socket, handlePickupProposal]);

  return (
    <SocketContext.Provider value={{ socket, pickupNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
