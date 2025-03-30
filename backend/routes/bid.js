const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { placeBid, updateBidStatus } = require("../controllers/Bid");


const router = express.Router();

// Place a bid (Only buyers)
router.post("/:id/bid", protect, authorize("buyer"), placeBid);

// Update bid status (Only sellers)
router.put("/:id/bid", protect, authorize("seller"), updateBidStatus);

module.exports = router;
