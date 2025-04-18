import "./RequestForm.css";
import { useState } from "react";
import axios from "axios";

function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemType: "",
    quantity: 1,
    condition: "any",
    description: "",
    urgency: "medium",
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests/createRequest`,
        formData,
        {
          withCredentials: true,
        }
      );
      alert("Request created successfully!");
      console.log(response.data);
    } catch (err) {
      console.error("Error creating request:", err);
      alert("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-form">
      <main>
        <div className="request-form-container">
          <div className="form-header">
            <h1>Request Items</h1>
            <p>
              Request items you need - our community will help connect you with
              donors
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
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select an item type
                    </option>
                    <option value="clothes">Clothes</option>
                    <option value="shoes">Shoes</option>
                    <option value="books">Books</option>
                    <option value="toys">Toys</option>
                    <option value="household">Household Items</option>
                    <option value="school_supplies">School Supplies</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="itemQuantity">Quantity Needed*</label>
                  <input
                    type="number"
                    id="itemQuantity"
                    name="quantity"
                    min={1}
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
                <label htmlFor="itemDescription">Description*</label>
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
              <button type="button" className="btn btn-outline" id="cancelBtn">
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
  );
}

export default RequestForm;
