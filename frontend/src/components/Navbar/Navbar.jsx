import "./Navbar.css";

function Navbar({ activeTab, setActiveTab }) {
  return (
    <header>
      <a className="logo" onClick={() => setActiveTab("requests")}>
        <svg viewBox="0 0 24 24" width={30} height={30} fill="currentColor">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 
            10 10 10-4.48 10-10S17.52 2 12 2zm0 
            18c-4.41 0-8-3.59-8-8s3.59-8 8-8 
            8 3.59 8 8-3.59 8-8 8zm-1-13c-1.1 
            0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 
            10c-2.21 0-4-1.79-4-4h2c0 1.1.9 2 
            2 2s2-.9 2-2h2c0 2.21-1.79 4-4 4z"
          />
        </svg>
        DonationHub
      </a>
      <nav>
        <div className="main-tabs">
          <a
            onClick={() => setActiveTab("requests")}
            className={`nav-button ${activeTab === "requests" ? "active" : ""}`}
          >
            View Requests
          </a>
          <a
            onClick={() => setActiveTab("donations")}
            className={`nav-button ${
              activeTab === "donations" ? "active" : ""
            }`}
          >
            View Donations
          </a>
        </div>
        <div className="side-tabs">
          <a
            onClick={() => setActiveTab("donationForm")}
            className={`small-tab ${
              activeTab === "donationForm" ? "active" : ""
            }`}
          >
            Donate
          </a>
          <a
            onClick={() => setActiveTab("requestForm")}
            className={`small-tab ${
              activeTab === "requestForm" ? "active" : ""
            }`}
          >
            Request
          </a>
          <a
            onClick={() => setActiveTab("notifications")}
            className={`small-tab ${
              activeTab === "notifications" ? "active" : ""
            }`}
          >
            <img width={24} height={24} src="/bell.png" alt="Notifications" />
          </a>
          <a
            onClick={() => setActiveTab("userInfo")}
            className={`small-tab ${activeTab === "userInfo" ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
              <path
                d="M12 12c2.21 0 4-1.79 
            4-4s-1.79-4-4-4-4 1.79-4 4 
            1.79 4 4 4zm0 2c-2.67 0-8 
            1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
