const Deal = require("../models/Deal");

// Create a new deal
const createDeal = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const seller = req.user.id; // Now, the logged-in user is the seller

    const deal = new Deal({ title, description, price, seller });
    await deal.save();

    res.status(201).json({ message: "Deal created successfully", deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all deals
const getDeals = async (req, res) => {
  try {
    let deals;

    if (req.user.role === "admin") {
      // Admin sees all deals
      deals = await Deal.find()
        .populate({ path: "seller", select: "name email" }) // Populate seller details
        .populate({ path: "bids.buyer", select: "name email" }); // Populate buyers in bids
    } else if (req.user.role === "seller") {
      // Seller sees only their created deals
      deals = await Deal.find({ seller: req.user.id })
        .populate({ path: "seller", select: "name email" })
        .populate({ path: "bids.buyer", select: "name email" });
    } else {
      // Buyer sees deals where they have placed a bid
      deals = await Deal.find({
        status: { $ne: "Completed" },
        buyer: { $exists: false },
      })
        .populate({ path: "seller", select: "name email" })
        .populate({ path: "bids.buyer", select: "name email" });
    }

    res.status(200).json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
const getDealDetails = async (req, res) => {
    try {
        const { id } = req.params; // Extract deal ID from request params

        // Fetch deal details and populate related fields
        const deal = await Deal.findById(id)
            .populate({ path: "seller", select: "name email" }) // Populate seller details
            .populate({ 
                path: "bids.buyer", 
                select: "name email" 
            }) // Populate buyer details in bids
            .lean(); // Convert to plain JS object for manipulation if needed

        if (!deal) {
            return res.status(404).json({ message: "Deal not found" });
        }

        // Transform bids to include buyer details along with bid info
        deal.bids = deal.bids.map(bid => ({
            _id: bid._id,
            buyer: bid.buyer || null, // Include populated buyer details
            offeredPrice: bid.offeredPrice,
            status: bid.status,
            createdAt: bid.createdAt,
            updatedAt: bid.updatedAt
        }));

        res.status(200).json(deal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  

const acceptDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    if (deal.seller.toString() === req.user.id) {
      return res
        .status(403)
        .json({ message: "Sellers cannot accept their own deals" });
    }

    if (deal.buyer) {
      return res
        .status(400)
        .json({ message: "Deal already assigned to a buyer" });
    }

    if (deal.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Completed deals cannot be accepted" });
    }

    deal.buyer = req.user.id;
    deal.status = "In Progress"; // Optionally change status
    await deal.save();

    res.status(200).json({ message: "Deal accepted successfully", deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDealStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "In Progress", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Only seller or admin can update the status
    if (deal.seller.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Prevent Completed -> Pending changes
    if (deal.status === "Completed" && status !== "Completed") {
      return res
        .status(400)
        .json({ message: "Completed deals cannot be changed" });
    }

    deal.status = status;
    await deal.save();

    res.status(200).json({ message: "Deal status updated", deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a deal (Only buyer)
const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Admin can delete any deal
    if (req.user.role === "admin") {
      await deal.deleteOne();
      return res
        .status(200)
        .json({ message: "Deal deleted successfully by admin" });
    }

    // Seller can delete deal **ONLY IF** no buyer is assigned
    if (deal.seller.toString() === req.user.id && !deal.buyer) {
      await deal.deleteOne();
      return res
        .status(200)
        .json({ message: "Deal deleted successfully by seller" });
    }

    // Buyer can delete deal **ONLY IF** they are assigned
    if (deal.buyer && deal.buyer.toString() === req.user.id) {
      await deal.deleteOne();
      return res
        .status(200)
        .json({ message: "Deal deleted successfully by buyer" });
    }

    res.status(403).json({ message: "Unauthorized to delete this deal" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDeal,
  getDeals,
  updateDealStatus,
  deleteDeal,
  acceptDeal,
  getDealDetails
};
