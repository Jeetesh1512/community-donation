const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    status: { type: String, enum: ["pending", "pickup_arranged", "completed","cancelled"], default: "pending" },
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
    pickupDetails: {
        proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        location: {
            lat: Number,
            lng: Number,
            address: String,
        },
        pickupDateTime: { type: Date },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
    },
    transactionDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
