const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        required: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
        type: String,
        required: true
    },
    coordinates: {
        lat: {
            type: Number,
            required: true
        }, lng: {
            type: Number,
            required: true
        }
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    donations: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
            status: { type: String, enum: ["pending", "matched", "completed"], default: "pending" },
        },
    ],
    requests: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
            status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        },
    ],
    transactions: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }
    ],
    joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
