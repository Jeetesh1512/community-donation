import { Link } from "react-router-dom";
import "./FrontPage.css";
import Impact from "../../components/Impact/Impact";

function FrontPage() {
  return (
    <>
      <header>
        <a href="#" className="logo">
          <svg viewBox="0 0 24 24" width={30} height={30} fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-2.21 0-4-1.79-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.21-1.79 4-4 4z" />
          </svg>
          DonationHub
        </a>
        <nav>
          <a href="#home" className="active">
            Home
          </a>
          <a href="#donate">Donate</a>
          <a href="#how-it-works">How it works</a>
          <a href="#request">How To Donate</a>
          <a href="#how-to-request">How To Request</a>
          <a href="#impact-container">Our Impact</a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-content">
            <h1>Give your unused items a new purpose</h1>
            <p>
              DonationHub connects donors of clothes, shoes, and other usable
              items directly with those in need. Make a difference today by
              donating items you no longer use.
            </p>
            <div className="btn-group">
              <Link to="/login" className="btn">
                Contribute
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/donationItems.jpg" alt="Donation items" />
          </div>
        </section>
        <section id="how-it-works" className="how-it-works">
          <h2>How DonationHub Works</h2>
          <p>
            Our platform simplifies the process of donating used items to those
            who need them most.
          </p>
          <div className="steps">
            <div className="step">
              <div className="step-icon">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-2.21 0-4-1.79-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.21-1.79 4-4 4z" />
                </svg>
              </div>
              <h3>Register &amp; List Items</h3>
              <p>
                Create an account and list items you want to donate, including
                details about condition.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="currentColor"
                >
                  <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zM6.5 9L10 5.5 13.5 9H11v4H9V9H6.5zm11 6L14 18.5 10.5 15H13v-4h2v4h2.5z" />
                </svg>
              </div>
              <h3>Get Matched</h3>
              <p>
                Our system matches your donations with recipients in need based
                on location and need.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="currentColor"
                >
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
              </div>
              <h3>Coordinate Handover</h3>
              <p>
                Schedule a convenient time and place for the donation handover
                or arrange pick-up/drop-off.
              </p>
            </div>
            <div className="step">
              <div className="step-icon">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="currentColor"
                >
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
                </svg>
              </div>
              <h3>Make an Impact</h3>
              <p>
                Track your contribution and see the positive difference you're
                making in someone's life.
              </p>
            </div>
          </div>
        </section>

        <section id="donate" className="donation-needs">
          <h2>Browse Donation Needs</h2>
          <p>Find individuals and organizations in need of your unused items</p>
          <div className="categories">
            <Link
              className="category"
              to="/login"
            >
              <div className="category-icon">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="currentColor"
                >
                  <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H4v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6h-4zm-5-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7 14.5H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v10z" />
                </svg>
              </div>
              <span>Clothes</span>
            </Link>
            <Link
              to="/login"
              className="category"
            >
              <div className="category-icon">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="currentColor"
                >
                  <path d="M13.127 14.56l1.43-1.43 6.44 6.443L19.57 21l-6.44-6.44zM17.42 8.83l2.86-2.86c-3.95-3.95-10.35-3.96-14.3-.02 3.93-1.3 8.31-.25 11.44 2.88zM5.95 5.98c-3.94 3.95-3.93 10.35.02 14.3l2.86-2.86C5.7 14.29 4.65 9.91 5.95 5.98zM5.97 5.96l-.01.01c-.38 3.01 1.17 6.88 4.3 10.02l5.73-5.73c-3.13-3.13-7.01-4.68-10.02-4.3z" />
                </svg>
              </div>
              <span>Shoes</span>
            </Link>
            <Link
              to="/login"
              className="category"
            >
              <div className="category-icon">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="currentColor"
                >
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
              </div>
              <span>Books</span>
            </Link>
            <Link
              to="/login"
              className="category"
            >
              <div className="category-icon">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="currentColor"
                >
                  <path d="M20 10.35V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h5v1.58c-1.13.52-2 1.66-2 3.01 0 1.84 1.57 3.41 3.4 3.41 1.17 0 2.14-.63 2.79-1.56l1.06 1.06 1.41-1.41-1.08-1.08c.35-.6.57-1.28.57-2.02 0-1.37-.88-2.53-2.09-3.01V15h4c1.1 0 2-.9 2-2v-.65l2 2L22 13l-2-2.65zM10 20.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM20 13H4V5h16v8z" />
                </svg>
              </div>
              <span>Toys</span>
            </Link>
            <Link
              to="/login"
              className="category"
            >
              <div className="category-icon">
                <svg
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  fill="currentColor"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z" />
                </svg>
              </div>
              <span>Others</span>
            </Link>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by item, location, or organization..."
            />
            <Link
              to="/login"
            >
              <svg
                viewBox="0 0 24 24"
                width={24}
                height={24}
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </Link>
          </div>
          <div className="needs-list">
            <div id="clothes" className="need-card">
              <img src="/winterClothes.jpg" alt="Winter clothes needed" />
              <div className="need-card-content">
                <h3>Winter clothes needed for homeless shelter</h3>
                <p className="organization">Sunshine Homeless Shelter</p>
                <div className="progress-text">
                  <span>65% of goal reached</span>
                  <span>35 items needed</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: "65%" }} />
                </div>
                <Link
                  className="btn donate-now-btn"
                  to="/login"
                  data-id="winter-clothes"
                >
                  Donate Now
                </Link>
              </div>
            </div>
            <div id="school-supplies" className="need-card">
              <img src="/children.jpg" alt="School supplies" />
              <div className="need-card-content">
                <h3>School supplies for underprivileged children</h3>
                <p className="organization">Education Foundation</p>
                <div className="progress-text">
                  <span>40% of goal reached</span>
                  <span>60 items needed</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: "40%" }} />
                </div>
                <Link
                  className="btn donate-now-btn"
                  to="/login"
                  data-id="school-supplies"
                >
                  Donate Now
                </Link>
              </div>
            </div>
            <div id="baby-clothes" className="need-card">
              <img src="/baby_clothes.jpg" alt="Baby clothes" />
              <div className="need-card-content">
                <h3>Baby clothes and toys for new mothers</h3>
                <p className="organization">Mother's Care Center</p>
                <div className="progress-text">
                  <span>75% of goal reached</span>
                  <span>25 items needed</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: "75%" }} />
                </div>
                <Link
                  className="btn donate-now-btn"
                  to="/login"
                  data-id="baby-items"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="impact-container">
          <Impact/>
        </section>
        <section id="request" className="how-to-start">
          <h2>How to Start Donating</h2>
          <p>Follow these simple steps to give your items a new purpose</p>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Create an Account</h3>
              <p>Sign up and complete your profile with basic information</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>List Your Items</h3>
              <p>Add photos and details about items you want to donate</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Get Matched</h3>
              <p>We'll connect you with someone who needs your items</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Arrange Handover</h3>
              <p>Coordinate pickup or drop-off at a convenient location</p>
            </div>
          </div>
          <Link
            to="/login"
            className="btn"
            id="start-donating-btn"
          >
            Start Donating Now
          </Link>
        </section>
        <section id="how-to-request" className="how-to-start">
          <h2>How to Request Items</h2>
          <p>Follow these simple steps to request items you need</p>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Create an Account</h3>
              <p>Sign up and verify your identity to join our community</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Specify Item Type</h3>
              <p>Select the category and details of items you need</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Explain Your Need</h3>
              <p>
                Share your situation and when and why these items would help you
              </p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Arrange Handover</h3>
              <p>Coordinate pickup or drop-off at a convenient location</p>
            </div>
          </div>
          <Link
            to="/login"
            className="btn"
            id="start-requesting-btn"
          >
            Request Items Now
          </Link>
        </section>
      </main>

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

export default FrontPage;
