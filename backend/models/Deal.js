const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
    {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        offeredPrice: { type: Number, required: true },
        status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    },
    { timestamps: true }
);

const dealSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 }, // Seller's original price
        status: { type: String, enum: ["Pending", "In Progress", "Completed", "Cancelled"], default: "Pending" },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        bids: [bidSchema], // Embedding bid schema to generate `_id` for each bid
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Deal", dealSchema);
