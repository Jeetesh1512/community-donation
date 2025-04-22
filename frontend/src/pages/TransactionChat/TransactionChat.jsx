import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TransactionChat.css";

function TransactionChat() {
  const { transactionId } = useParams();
  const { user } = useContext(AuthContext);
  const { socket, joinRoom } = useSocket();

  const [transaction, setTransaction] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const fetchTransaction = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/transactions/getTransaction/${transactionId}`,
        { withCredentials: true }
      );
      setTransaction(res.data.transaction);
    } catch (err) {
      console.error("Failed to fetch transaction:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/messages/getMessages/${transactionId}`,
        { withCredentials: true }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!content.trim()) return;

    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/messages/sendMessage/${transactionId}`,
        { content },
        { withCredentials: true }
      );
      setContent("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  useEffect(() => {
    if (socket && transactionId) {
      joinRoom(transactionId);

      socket.on("newMessage", (msg) => {
        if (msg.transaction.toString() === transactionId) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      return () => {
        socket.off("newMessage");
      };
    }
  }, [socket, transactionId, joinRoom]);

  useEffect(() => {
    fetchTransaction();
    fetchMessages();
  }, [transactionId]);

  return (
    <>
      <div className="chat-container">
        <h2>Transaction Chat</h2>

        {transaction?.status === "pending" && (
          <button onClick={() => navigate(`/${transactionId}/proposePickup`)} className="btn">Arrange Pickup</button>
        )}

        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`chat-message ${
                msg.sender._id === user._id ? "sent" : "received"
              }`}
            >
              <div className="chat-content">{msg.content}</div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  );
}

export default TransactionChat;
