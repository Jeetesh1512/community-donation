const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, 
    description: { type: String },
    quantity: { type: Number, required: true },
    imageUrl: [{ type: String }], 
    condition: { type: String, enum: ["new", "used","any"], default: "any" },

    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", default: null },
    
    status: { type: String, enum: ["available", "matched", "donated"], default: "available" },  

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Item", ItemSchema);
