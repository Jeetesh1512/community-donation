const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    status: { type: String, enum: ["pending", "matched", "completed"], default: "pending" },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Donation", DonationSchema);
