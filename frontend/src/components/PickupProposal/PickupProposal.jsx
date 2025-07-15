import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import LocationMap from "../../components/LocationMap/LocationMap";

const PickupProposalModal = () => {
  const [latLng, setLatLng] = useState({ lat: "", lng: "" });
  const [address, setAddress] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const navigate = useNavigate();
  const { transactionId } = useParams();

  const handlePickupSubmit = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/transactions/proposePickup/${transactionId}`,
        { location: { lat: latLng.lat, lng: latLng.lng, address }, pickupDateTime },
        { withCredentials: true }
      );
      alert("Pickup proposal submitted!");
      navigate("/home");
    } catch (err) {
      console.error("Error proposing pickup:", err);
      alert("Error proposing pickup");
    }
  };

  return (
    <div className="pickup-proposal-modal">
      <h2>Propose Pickup</h2>

      <label>Pickup Location</label>
      <LocationMap setLatLng={setLatLng} setAddress={setAddress} />
      <div>{address || "Click on the map to select location"}</div>

      <label>Pickup Date and Time</label>
      <input
        type="datetime-local"
        value={pickupDateTime}
        onChange={(e) => setPickupDateTime(e.target.value)}
      />

      <button onClick={handlePickupSubmit}>Submit Proposal</button>
      <button onClick={() => navigate(`/transaction/${transactionId}`)}>Cancel</button>
    </div>
  );
};

export default PickupProposalModal;
