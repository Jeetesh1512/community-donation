import { useEffect, useState } from "react";
import axios from "axios";
import "./Requests.css";

function Requests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests`,
        {
          withCredentials: true,
        }
      );
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <main>
      <div className="container">
        <div className="page-title">
          <h1>All Requests</h1>
          <p>Browse the latest requests from users in need.</p>
        </div>

        <div className="items-grid" id="requestsGrid">
          {requests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="item-card">
                <h3>{request.itemType}</h3>
                <p><strong>Requested By:</strong> {request.userId?.name}</p>
                <p><strong>Description:</strong> {request.description}</p>
                <p><strong>Quantity:</strong> {request.quantity}</p>
                <p><strong>Condition:</strong> {request.condition}</p>
                <p><strong>Urgency:</strong> {request.urgency}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default Requests;
