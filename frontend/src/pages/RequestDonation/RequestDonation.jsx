import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { loadGoogleMapsScript } from "../../utils/loadGoogleMapsScripts";
import { initMap } from "../../utils/mapUtils";
import { FaLocationArrow } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";

function RequestDonation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const [donation, setDonation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("medium"); // FIXED: changed from 'normal'
  const [condition, setCondition] = useState("any"); // ADDED: condition
  const [pickupDate, setPickupDate] = useState("");
  const [latLng, setLatLng] = useState({ lat: "", lng: "" });
  const [address, setAddress] = useState("");
  const [goToMyLocation, setGoToMyLocation] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/donations/${id}`
        );
        setDonation(data);
      } catch (err) {
        console.error("Failed to fetch donation:", err);
      }
    };
    fetchDonation();
  }, [id]);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      setTimeout(() => {
        const goToLocationFn = initMap(setLatLng, setAddress);
        setGoToMyLocation(() => goToLocationFn);
        goToLocationFn();
      }, 300);
    });
  }, []);

  // Set the min date to today's date
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address || !latLng.lat || !latLng.lng || !pickupDate) {
      alert("Please select a location and pickup date.");
      return;
    }

    try {
      // Create the request
      const requestRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests/createRequest`,
        {
          itemType: donation.itemId?.category,
          quantity: Number(quantity),
          condition,
          description,
          urgency,
          coordinates: {
            lat: latLng.lat,
            lng: latLng.lng,
          },
        },
        { withCredentials: true }
      );

      const requestId = requestRes.data.request?._id;

      // Create the transaction
      const transactionRes = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/transactions/createTransaction`,
        {
          donorId: donation.donorId,
          recipientId: user._id,
          itemId: donation.itemId._id,
          donationId: id,
          requestId,
        },
        { withCredentials: true }
      );

      const transactionId = transactionRes.data.transaction?._id;
      
      await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/transactions/proposePickup/${transactionId}`,
        {
          location: {
            address: address,
            lat: latLng.lat,
            lng: latLng.lng,
          },
          pickupDateTime: pickupDate,
        },
        { withCredentials: true }
      );

      navigate("/requests/confirmation");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  if (!donation) return <p>Loading donation details...</p>;

  return (
    <div className="container">
      <h2>Request Item: {donation.itemId?.name}</h2>
      <form onSubmit={handleSubmit} className="request-form">
        <label>
          Quantity:
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>

        <label>
          Reason:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          Urgency:
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label>
          Condition:
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="any">Any</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </label>

        <label>
          Pickup Date:
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            min={today} // Prevent dates before today
          />
        </label>

        <div className="map-column" style={{ margin: "20px 0" }}>
          <label style={{ marginBottom: "10px", display: "block" }}>
            Location (Click on the map)
          </label>
          <div
            id="map"
            style={{ width: "100%", height: "300px", borderRadius: "8px" }}
          ></div>
          <div
            id="coordinates"
            style={{ marginTop: "10px", color: "#555", fontSize: "14px" }}
          >
            <p>
              {address
                ? `Selected Address: ${address}`
                : "Click on the map to select a location."}
            </p>
          </div>
          <button
            type="button"
            className="location-btn"
            onClick={() => goToMyLocation && goToMyLocation()}
          >
            <FaLocationArrow style={{ marginRight: "8px" }} />
            Use My Current Location
          </button>
        </div>

        <button type="submit" className="submit-btn">
          Submit Request
        </button>
      </form>
    </div>
  );
}

export default RequestDonation;
