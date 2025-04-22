const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemType: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    fulfilledQuantity: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    condition: { type: String, enum: ["new", "used", "any"], default: "any" },
    urgency: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    coordinates: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true,
        },
    },
    requestType:{
        type:String,
        enum:["public","personal"],
        default:"public",
    },
    createdAt: { type: Date, default: Date.now },
});


RequestSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Request", RequestSchema);
