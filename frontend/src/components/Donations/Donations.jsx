import { useEffect, useState } from "react";
import axios from "axios";
import "./Donations.css";

function Donations() {
  const [donations, setDonations] = useState([]);
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDonations = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/donations`,
        {
          params: {
            category,
            condition,
            sort,
            search,
            page,
            limit: 9,
          },
        }
      );
      setDonations(data.donations);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [category, condition, sort, search, page]);

  return (
    <main>
      <div className="container">
        <div className="page-title">
          <h1>Available Items for Request</h1>
          <p>Browse through items generously donated by our community.</p>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-options">
            <select className="filter-select" onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
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

            <select className="filter-select" onChange={(e) => setCondition(e.target.value)}>
              <option value="">Any Condition</option>
              <option value="new">New</option>
              <option value="like new">Like New</option>
              <option value="mildly used">Mildly Used</option>
              <option value="heavily used">Heavily Used</option>
              <option value="needs repair">Needs Repair</option>
            </select>

            <select className="filter-select" onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Donations Grid */}
        <div className="items-grid" id="itemsGrid">
          {donations.length === 0 ? (
            <p>No items found.</p>
          ) : (
            donations.map((donation) => (
              <div key={donation._id} className="item-card">
                <img className="item-image" src={donation.itemId?.imageUrl?.[0]} alt={donation.itemId?.name} />
                <h3>{donation.itemId?.name}</h3>
                <p>{donation.itemId?.description}</p>
                <p><strong>Condition:</strong> {donation.itemId?.condition}</p>
                <button className="btn">Request</button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={i + 1 === page ? "active" : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Donations;
