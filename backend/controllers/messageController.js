const Message = require("../models/Message");
const Deal = require("../models/Deal");

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const deal = await Deal.findById(req.params.dealId)
      .populate("seller")
      .populate("bids.buyer");

    if (!deal) return res.status(404).json({ message: "Deal not found" });

    // Check if user is seller or any bid buyer
    const isSeller = deal.seller && deal.seller._id.toString() === req.user.id;
    const isBuyer = deal.bids.some(
      (bid) => bid.buyer && bid.buyer._id.toString() === req.user.id
    );

    if (!isSeller && !isBuyer) {
      return res
        .status(403)
        .json({ message: "Unauthorized to message in this deal" });
    }

    // Determine receiver - if sender is seller, receiver is buyer and vice versa
    let receiverId;
    if (isSeller) {
      // Find the most recent/accepted bid's buyer
      const acceptedBid = deal.bids.find((bid) => bid.status === "Accepted");
      receiverId = acceptedBid?.buyer?._id || deal.bids[0]?.buyer?._id;
    } else {
      receiverId = deal.seller._id;
    }

    if (!receiverId) {
      return res.status(400).json({ message: "No valid receiver found" });
    }

    const message = new Message({
      deal: deal._id,
      sender: req.user.id,
      receiver: receiverId,
      content,
    });

    await message.save();
    await message.populate("sender", "name email");
    await message.populate("receiver", "name email");

    // Emit message to relevant users
    req.app.get("io").to(deal._id.toString()).emit("receiveMessage", message);
    req.app.get("io").to(receiverId.toString()).emit("receiveMessage", message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages where the user is the sender
    const messages = await Message.find({ sender: userId })
      .populate("deal", "title") // Get deal details
      .populate("sender", "name email") // Get sender details
      .sort({ createdAt: -1 }); // Sort by latest messages

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all messages for a deal
const getDealMessages = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.dealId)
      .populate("seller") // Only populate seller as buyer isn't directly on Deal
      .populate("bids.buyer"); // Populate buyers from bids

    if (!deal) return res.status(404).json({ message: "Deal not found" });

    // Check if user is the seller or any of the buyers in bids
    const isSeller = deal.seller && deal.seller._id.toString() === req.user.id;
    const isBuyer = deal.bids.some(
      (bid) => bid.buyer && bid.buyer._id.toString() === req.user.id
    );

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ message: "Unauthorized to view messages" });
    }

    // Find messages where:
    // 1. The deal matches
    // AND
    // 2. Either the user is the sender OR the receiver
    const messages = await Message.find({
      deal: req.params.dealId,
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDealsWithMessages = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Find messages where the user is either the sender or receiver
      const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
        .sort({ createdAt: -1 }) // Get latest messages first
        .populate({
          path: "deal",
          select: "title price status", // Fetch status to filter
        })
        .populate("sender", "name")
        .populate("receiver", "name");
  
      // Extract unique deals and get the latest message per deal
      const dealMap = new Map();
      messages.forEach((msg) => {
        const deal = msg.deal;
        if (!deal || deal.status === "Completed") return; // ✅ Skip completed deals
  
        const dealId = deal._id.toString();
        if (!dealMap.has(dealId)) {
          dealMap.set(dealId, {
            dealId,
            dealTitle: deal.title,
            price: deal.price,
            latestMessage: { id: msg._id, text: msg.content },
            buyerId: msg.sender._id.toString(), // Assuming sender is the buyer
            buyerName: msg.sender.name,
          });
        }
      });
  
      console.log("Deals with messages:", Array.from(dealMap.values()));
  
      res.status(200).json(Array.from(dealMap.values()));
    } catch (error) {
      console.error("Error fetching deals with messages:", error);
      res.status(500).json({ message: error.message });
    }
};
  

module.exports = {
  sendMessage,
  getDealMessages,
  getUserMessages,
  getDealsWithMessages,
};
