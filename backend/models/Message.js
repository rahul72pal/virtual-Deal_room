const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Fixed Typo
        content: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
