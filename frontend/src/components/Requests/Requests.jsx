import { useEffect, useState } from "react";
import axios from "axios";
import "./Requests.css";

function Requests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests`,
        { withCredentials: true }
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
            <div className="no-items">
              <h3>No requests found</h3>
              <p>Try again later or adjust your criteria.</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="request-card">
                <div className="request-content">
                  <h3 className="request-title">{request.itemType.toUpperCase()}</h3>
                  <p className="request-meta">
                    <strong>Requested By:</strong>{" "}
                    {request.userId?.name || "Anonymous"}
                  </p>
                  <p className="request-description">{request.description}</p>
                  <div className="request-details">
                    <span>
                      <strong>Qty:</strong> {request.quantity}
                    </span>
                    <span>
                      <strong>Condition:</strong> {request.condition}
                    </span>
                    <span>
                      <strong>Urgency:</strong> {request.urgency}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default Requests;
