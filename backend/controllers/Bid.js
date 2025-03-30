const Deal = require("../models/Deal");

const Message = require("../models/Message"); // Import Message model

const placeBid = async (req, res) => {
  try {
    const { offeredPrice } = req.body;
    const deal = await Deal.findById(req.params.id);

    if (!deal) return res.status(404).json({ message: "Deal not found" });

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (deal.seller && deal.seller.toString() === req.user.id) {
      return res
        .status(403)
        .json({ message: "Sellers cannot place bids on their own deals" });
    }

    const existingBid = deal.bids.find(
      (bid) => bid.buyer?.toString() === req.user.id
    );
    if (existingBid) {
      return res
        .status(400)
        .json({ message: "You have already placed a bid on this deal" });
    }

    deal.bids.push({ buyer: req.user.id, offeredPrice, status: "Pending" });
    await deal.save();

    console.log("Deal Here =", deal);

    // ✅ Send a message to the seller
    const message = new Message({
      deal: deal._id,
      sender: req.user.id,
      receiver: deal.seller, // Seller receives the message
      content: `New bid placed: $${offeredPrice}`,
    });

    await message.save();
    await message.populate("sender", "name email"); // Populate sender details

    // ✅ Emit a bid notification
    req.app
      .get("io")
      .to(deal._id.toString())
      .emit("newBid", { buyerId: req.user.id, offeredPrice });

    // ✅ Emit message to the seller
    req.app
      .get("io")
      .to(deal.seller.toString())
      .emit("receiveMessage", message);

    res.status(201).json({ message: "Bid placed successfully", deal });
  } catch (error) {
    console.log("Error in placeBid:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateBidStatus = async (req, res) => {
  try {
    const { bidId, status } = req.body; // "Accepted" or "Rejected"
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    if (deal.seller.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the seller can accept/reject bids" });
    }

    const bid = deal.bids.id(bidId); // Retrieve bid by its generated `_id`
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    bid.status = status; // Update status (Accepted/Rejected)
    await deal.save();

    res
      .status(200)
      .json({ message: `Bid ${status.toLowerCase()} successfully`, deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeBid,
  updateBidStatus,
};
