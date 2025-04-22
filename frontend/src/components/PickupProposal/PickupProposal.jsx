import React, { useState, useEffect } from "react";
import axios from "axios";
import { loadGoogleMapsScript } from "../../utils/loadGoogleMapsScripts";
import { initMap } from "../../utils/mapUtils";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const PickupProposalModal = () => {
  const [latLng, setLatLng] = useState({ lat: "", lng: "" });
  const [address, setAddress] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [goToMyLocation, setGoToMyLocation] = useState(null);
  const navigate = useNavigate();
  const {transactionId} = useParams();

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      window.initMap = () => {
        const goToLocationFn = initMap(setLatLng, setAddress);
        setGoToMyLocation(() => goToLocationFn);
        goToLocationFn();
      };
    });
  }, []);

  const handlePickupSubmit = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/transactions/proposePickup/${transactionId}`,
        { location: { lat: latLng.lat, lng: latLng.lng, address }, pickupDateTime },
        { withCredentials: true }
      );
      navigate(`/home`);
    } catch (err) {
      console.error("Error proposing pickup:", err);
    }
  };

  return (
    <div className="pickup-proposal-modal">
      <h2>Propose Pickup</h2>
      <label>Pickup Location</label>
      <div id="map" style={{ height: "300px", width: "100%" }}></div>
      <div>{address}</div>

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
