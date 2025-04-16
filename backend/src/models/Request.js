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
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    createdAt: { type: Date, default: Date.now }
});

RequestSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Request", RequestSchema);
