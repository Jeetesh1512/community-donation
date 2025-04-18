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
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/impact`
      );
      setImpactData(data);
    } catch (error) {
      console.error("Error fetching impact data:", error);
    }
  };

  useEffect(() => {
    fetchImpactStats();
  }, []);

  return (
    <section id="impact" className="impact">
      <h2>Our Impact So Far</h2>
      <p>
        Together, we're making a meaningful difference in communities across the
        country
      </p>
      <div className="stats">
        <div className="stat">
          <div className="stat-number">{impactData.totalQuantityDonated}</div>
          <div className="stat-text">Items Donated</div>
        </div>
        <div className="stat">
          <div className="stat-number">{impactData.totalDonors}</div>
          <div className="stat-text">Donors</div>
        </div>
        <div className="stat">
          <div className="stat-number">{impactData.totalDonations}</div>
          <div className="stat-text">Total Donations</div>
        </div>
        <div className="stat">
          <div className="stat-number">{impactData.totalPeopleHelped}</div>
          <div className="stat-text">People Helped</div>
        </div>
      </div>
    </section>
  );
}

export default Impact;
