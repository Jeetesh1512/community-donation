import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import DonationForm from "../../components/DonationForm/DonationForm";
import RequestForm from "../../components/RequestForm/RequestForm";
import Requests from "../../components/Requests/Requests";
import Donations from "../../components/Donations/Donations";
import UserInfo from "../../components/UserInfo/UserInfo";
import Impact from "../../components/Impact/Impact";
import Notifications from "../../components/Notifications/Notifications";

function Home() {
  const [activeTab, setActiveTab] = useState("donations");

  return (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ padding: "2rem", textAlign: "center" }}>
        {activeTab === "donationForm" && <DonationForm />}
        {activeTab === "requestForm" && <RequestForm />}
        {activeTab === "requests" && <Requests />}
        {activeTab === "donations" && <Donations />}
        {activeTab === "notifications" && <Notifications />}
        {activeTab === "userInfo" && <UserInfo />}
      </main>
      <Impact />
      <footer>
        <div className="footer-logo">DonationHub</div>
        <p className="footer-text">
          Connecting donors with those in need to give unused items a new
          purpose.
        </p>
      </footer>
    </>
  );
}

export default Home;
