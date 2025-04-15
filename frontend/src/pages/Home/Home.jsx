import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import DonationForm from "../../components/DonationForm/DonationForm";
import RequestForm from "../../components/RequestForm/RequestForm";
import Requests from "../../components/Requests/Requests";
import Donations from "../../components/Donations/Donations";
import UserInfo from "../../components/UserInfo/UserInfo"
import Impact from "../../components/Impact/Impact";

function Home() {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <>
      <Impact/>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ padding: "2rem", textAlign: "center" }}>
        {activeTab === "donationForm" && <DonationForm />}
        {activeTab === "requestForm" && <RequestForm />}
        {activeTab === "requests" && <Requests />}
        {activeTab === "donations" && <Donations />}
        {activeTab === "userInfo" && <UserInfo />}
      </main>
    </>
  );
}

export default Home;
