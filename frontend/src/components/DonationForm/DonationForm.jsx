import "./DonationForm.css";
import { useState } from "react";
import axios from "axios";

function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    quantity: 1,
    condition: "new",
    images: [],
    previews: [],
  });

  const conditions = [
    { value: "new", description: "Brand new, never used" },
    { value: "like new", description: "Barely used, in excellent condition" },
    { value: "mildly used", description: "Slight wear, but still functional" },
    { value: "heavily used", description: "Noticeable wear, but still usable" },
    {
      value: "needs repair",
      description: "Requires fixing or some parts missing",
    },
  ];

  const handleImageSelect = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => {
      const updatedImages = [...prev.images];
      const updatedPreviews = [...prev.previews];
      updatedImages[index] = file;
      updatedPreviews[index] = previewUrl;

      return { ...prev, images: updatedImages, previews: updatedPreviews };
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setFormData((prev) => ({ ...prev, images: Array.from(files) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleConditionClick = (conditionValue) => {
    setFormData((prev) => ({ ...prev, condition: conditionValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("quantity", formData.quantity);
    data.append("condition", formData.condition);
    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/donations/donate`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      alert("Donation created successfully!");
      console.log(res.data);
    } catch (error) {
      console.error("Error creating donation:", error);
      alert("Failed to create donation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="donation-form">
      <main>
        <div className="donation-form-container">
          <div className="form-header">
            <h1>Donate an Item</h1>
            <p>Share items you no longer need with those who could use them</p>
          </div>

          <form onSubmit={handleSubmit} id="donationForm">
            <div className="form-section">
              <h2>Item Information</h2>

              <div className="form-group">
                <label htmlFor="itemName">Item Name*</label>
                <input
                  type="text"
                  id="itemName"
                  name="name"
                  required
                  placeholder="E.g., Winter Jacket, Children's Books"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="itemCategory">Category*</label>
                  <select
                    id="itemCategory"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
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
                </div>

                <div className="form-group">
                  <label htmlFor="itemQuantity">Quantity*</label>
                  <input
                    type="number"
                    id="itemQuantity"
                    name="quantity"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Condition*</label>
                <div className="condition-options">
                  {conditions.map((cond) => (
                    <div
                      key={cond.value}
                      className={`condition-option ${
                        formData.condition === cond.value ? "selected" : ""
                      }`}
                      onClick={() => handleConditionClick(cond.value)}
                    >
                      <h3>
                        {cond.value.charAt(0).toUpperCase() +
                          cond.value.slice(1)}
                      </h3>
                      <p>{cond.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="itemDescription">Description</label>
                <textarea
                  id="itemDescription"
                  name="description"
                  placeholder="Provide more details (size, color, brand, etc.)"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-section">
              <h2>Item Images</h2>
              <div className="image-upload-container">
                {[0, 1, 2].map((index) => (
                  <div className="image-upload-box" key={index}>
                    <input
                      type="file"
                      accept="image/*"
                      className="image-input"
                      onChange={(e) => handleImageSelect(e, index)}
                    />
                    {formData.previews[index] ? (
                      <img
                        src={formData.previews[index]}
                        alt={`Preview ${index + 1}`}
                        className="image-preview"
                      />
                    ) : (
                      <div className="icon">+</div>
                    )}
                  </div>
                ))}
              </div>
              <p className="note-text">
                Add up to 3 images of your item. Clear photos help get your
                items matched faster.
              </p>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isSubmitting} className="btn">
                {isSubmitting ? "Creating Donation..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default DonationForm;
