const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemType: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    condition: { type: String, enum: ["new", "used", "any"], default: "any" },
    status: { type: String, enum: ["pending", "matched", "completed"], default: "pending" },
    urgency: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Request", RequestSchema);
