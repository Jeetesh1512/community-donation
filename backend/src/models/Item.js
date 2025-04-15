const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    imageUrl: [{ type: String }],
    condition: {
        type: String,
        enum: ["new", "like new", "mildly used", "heavily used", "needs repair"],
        default: "mildly used"
    },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", default: null },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", default: null },

    status: { type: String, enum: ["available", "matched", "donated"], default: "available" },

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Item", ItemSchema);
