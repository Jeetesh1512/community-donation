import { useState, useContext, useEffect } from "react";
import "./UserInfo.css";
import {useNavigate} from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";

function UserInfo() {
  const [profileTab, setProfileTab] = useState("profile");
  const { user, loading } = useContext(AuthContext);

  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading user info...</div>;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (profileTab === "myRequests") {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/requests/myRequests`,
            {
              withCredentials: true,
            }
          );
          setRequests(res.data.requests);
        } else if (profileTab === "myDonations") {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/donations/myDonations`,
            {
              withCredentials: true,
            }
          );
          setDonations(res.data.donations);
        } else if (profileTab === "myTransactions") {
          const res = await axios.get(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/api/transactions/myTransactions`,
            {
              withCredentials: true,
            }
          );
          setTransactions(res.data.transactions);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [profileTab]);

  return (
    <>
      <div className="user-info-container">
        <div className="profile-tabs">
          <button
            className={profileTab === "profile" ? "active" : ""}
            onClick={() => setProfileTab("profile")}
          >
            Profile
          </button>
          <button
            className={profileTab === "myRequests" ? "active" : ""}
            onClick={() => setProfileTab("myRequests")}
          >
            My Requests
          </button>
          <button
            className={profileTab === "myDonations" ? "active" : ""}
            onClick={() => setProfileTab("myDonations")}
          >
            My Donations
          </button>
          <button
            className={profileTab === "myTransactions" ? "active" : ""}
            onClick={() => setProfileTab("myTransactions")}
          >
            My Transactions
          </button>
        </div>

        <div className="profile-content">
          {profileTab === "profile" && (
            <div>
              <h2>My Profile</h2>
              <p>Name: {user?.name}</p>
              <p>Email: {user?.email}</p>
              <p>Address: {user?.address}</p>
            </div>
          )}
          {profileTab === "myRequests" && (
            <div>
              <h2>My Requests</h2>
              {requests?.length > 0 ? (
                <ul>
                  {requests.map((req, index) => (
                    <li key={index}>
                      <p>
                        <strong>Item:</strong> {req.itemType}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {req.quantity}
                      </p>
                      <p>
                        <strong>Condition:</strong> {req.condition}
                      </p>
                      <p>
                        <strong>Urgency:</strong> {req.urgency}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {req.isCompleted ? "Completed" : "Pending"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No requests yet.</p>
              )}
            </div>
          )}
          {profileTab === "myDonations" && (
            <div>
              <h2>My Donations</h2>
              {donations?.length > 0 ? (
                <ul>
                  {donations.map((don, index) => (
                    <li key={index}>
                      <p>
                        <strong>Item:</strong> {don.itemType}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {don.quantity}
                      </p>
                      <p>
                        <strong>Condition:</strong> {don.condition}
                      </p>
                      <p>
                        <strong>Donated On:</strong>{" "}
                        {new Date(don.createdAt).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {don.isDonated ? "Donated" : "Pending"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No donations yet.</p>
              )}
            </div>
          )}
          
          {profileTab === "myTransactions" && (
            <div>
              <h2>My Transactions</h2>
              {transactions?.length > 0 ? (
                <ul>
                  {transactions.map((txn, index) => (
                    <li key={index}>
                      {console.log(txn)}
                      <p>
                        <strong>Item:</strong> {txn.itemId.category}
                      </p>
                      <p>
                        <strong>Description:</strong> {txn.itemId.description}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {txn.itemId.quantity}
                      </p>
                      {txn.pickupLocation && (
                        <>
                          <p>
                            <strong>Pickup Location:</strong>{" "}
                            {txn.pickupLocation}
                          </p>
                          <p>
                            <strong>Pickup Date:</strong>{" "}
                            {new Date(txn.pickupDate).toLocaleDateString()}
                          </p>
                        </>
                      )}
                      {txn.status && (txn.status !== "completed") && (
                        <>
                          <button onClick={() => navigate(`/${txn._id}/chat`)} className="btn">Chat</button>
                        </>
                      )}
                      <p>
                        <strong>Status:</strong> {txn.status}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No transactions found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserInfo;
