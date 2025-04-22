import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

function RequestDonation() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemType: "",
    quantity: 1,
    condition: "any",
    description: "",
    urgency: "medium",
    requestType: "personal",
  });

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/donations/${donationId}`
        );
        setDonation(data);
        setFormData((prev) => ({
          ...prev,
          itemType: data.itemId.category,
          quantity: 1,
        }));
      } catch (err) {
        console.error("Failed to fetch donation:", err);
      }
    };
    fetchDonation();
  }, [donationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConditionSelect = (value) => {
    setFormData((prev) => ({ ...prev, condition: value }));
  };

  const handleUrgencySelect = (value) => {
    setFormData((prev) => ({ ...prev, urgency: value }));
  };

  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const requestRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests/createRequest`,
        {
          ...formData,
        },
        { withCredentials: true }
      );

      const requestId = requestRes.data.request._id;

      const transactionRes = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/transactions/createTransaction`,
        {
          donorId: donation.donorId._id,
          recipientId: user._id,
          itemId: donation.itemId._id,
          donationId: donation._id,
          requestId,
        },
        { withCredentials: true }
      );

      const transactionId = transactionRes.data.transaction._id;

      if (transactionId) {
        navigate(`/${transactionId}/chat`);
      } else {
        alert("Transaction creation failed.");
        navigate("/home");
      }
    } catch (err) {
      console.error("Error during request or transaction:", err);
      alert("Failed to submit your request and transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="request-form">
        <main>
          <div className="request-form-container">
            <div className="form-header">
              <h1>Request Items</h1>
              <p>
                Request items you need - our community will help connect you
                with donors
              </p>
            </div>

            <form id="RequestForm" onSubmit={handleSubmit}>
              {/* --- Request Details --- */}
              <div className="form-section request-details">
                <h2>Request Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="itemType">Item Type*</label>
                    <select
                      id="itemType"
                      name="itemType"
                      value={formData.itemType}
                      disabled
                    >
                      <option value={formData.itemType}>
                        {formData.itemType.charAt(0).toUpperCase() +
                          formData.itemType.slice(1)}
                      </option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="itemQuantity">
                      Quantity Needed* (Only {donation?.itemId?.quantity}{" "}
                      available)
                    </label>
                    <input
                      type="number"
                      id="itemQuantity"
                      name="quantity"
                      min={1}
                      max={donation?.itemId?.quantity}
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* --- Condition Options --- */}
                <div className="form-group">
                  <label>Acceptable Condition*</label>
                  <div className="condition-options">
                    {["new", "used", "any"].map((value) => (
                      <div
                        key={value}
                        className={`condition-option ${
                          formData.condition === value ? "selected" : ""
                        }`}
                        data-value={value}
                        onClick={() => handleConditionSelect(value)}
                      >
                        <div className="condition-option-icon">
                          <svg
                            viewBox="0 0 24 24"
                            width={30}
                            height={30}
                            fill="currentColor"
                          >
                            <path
                              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
                          10-4.48 10-10S17.52 2 12 2zm-2 
                          15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 
                          8l-9 9z"
                            />
                          </svg>
                        </div>
                        <h3>
                          {value === "new"
                            ? "New Only"
                            : value === "used"
                            ? "Used Acceptable"
                            : "Any Condition"}
                        </h3>
                        <p>
                          {value === "new"
                            ? "Only brand new, unused items"
                            : value === "used"
                            ? "Previously used but still functional"
                            : "Any condition is acceptable"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- Description --- */}
                <div className="form-group">
                  <label htmlFor="itemDescription">
                    Reason For the request*
                  </label>
                  <textarea
                    id="itemDescription"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please describe what you need in detail (size, color, specific requirements, etc.)"
                    required
                  />
                </div>
              </div>

              {/* --- Urgency Section --- */}
              <div className="form-section deadline-section">
                <h2>Urgency Level</h2>
                <p className="note-text">
                  This helps donors understand how quickly you need the items
                </p>
                <div className="urgency-options">
                  {["low", "medium", "high"].map((level) => (
                    <div
                      key={level}
                      className={`urgency-option ${
                        formData.urgency === level ? "selected" : ""
                      }`}
                      data-value={level}
                      onClick={() => handleUrgencySelect(level)}
                    >
                      <div className="urgency-option-icon">
                        <svg
                          viewBox="0 0 24 24"
                          width={30}
                          height={30}
                          fill="currentColor"
                        >
                          <path
                            d="M12 2C6.48 2 2 6.48 2 
                        12s4.48 10 10 10 10-4.48 
                        10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                          />
                        </svg>
                      </div>
                      <h3>
                        {level === "low"
                          ? "Low Urgency"
                          : level === "medium"
                          ? "Medium Urgency"
                          : "High Urgency"}
                      </h3>
                      <p>
                        {level === "low"
                          ? "No immediate need (within 30+ days)"
                          : level === "medium"
                          ? "Need within 2-4 weeks"
                          : "Urgent need (within 1-2 weeks)"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- Action Buttons --- */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  id="cancelBtn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn">
                  {isSubmitting ? "Creating request..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default RequestDonation;
