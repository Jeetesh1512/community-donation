import { useEffect, useState } from "react";
import axios from "axios";
import "./Impact.css";

function Impact() {
  const [impactData, setImpactData] = useState({
    totalDonations: 0,
    totalPeopleHelped: 0,
    totalDonors: 0,
    totalQuantityDonated: 0, 
  });

  const fetchImpactStats = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/impact`);
      setImpactData(data);
    } catch (error) {
      console.error("Error fetching impact data:", error);
    }
  };

  useEffect(() => {
    fetchImpactStats();
  }, []);

  return (
    <div className="impact-container">
      <div className="impact-card">
        <h2>Total Donations</h2>
        <p>{impactData.totalDonations}</p>
      </div>
      <div className="impact-card">
        <h2>People Helped</h2>
        <p>{impactData.totalPeopleHelped}</p>
      </div>
      <div className="impact-card">
        <h2>Total Donors</h2>
        <p>{impactData.totalDonors}</p>
      </div>
      <div className="impact-card">
        <h2>Total Items Donated</h2>
        <p>{impactData.totalQuantityDonated}</p> 
      </div>
    </div>
  );
}

export default Impact;
