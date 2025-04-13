const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true }, 
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zip: String,
        coordinates: { lat: Number, lng: Number },
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
