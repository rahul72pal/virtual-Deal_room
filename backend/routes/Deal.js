const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { createDeal, getDeals, updateDealStatus, deleteDeal, acceptDeal, getDealDetails } = require("../controllers/deals");

const router = express.Router();

// Routes for deals
router.post("/", protect, authorize("seller"), createDeal); // Only sellers can create deals

router.get("/", protect, authorize("buyer", "seller"), getDeals); // Both buyers & sellers can see deals

router.get("/:id/dealDetails", protect, authorize("buyer", "seller"), getDealDetails);

router.put("/:id/status", protect, authorize("seller"), updateDealStatus); // Only sellers can update status

router.put("/:id/buy", protect, authorize("buyer"), acceptDeal); // ✅ Buyers can accept a deal

router.delete("/:id", protect, authorize("seller"), deleteDeal); // ✅ Only buyers can delete deals


module.exports = router;
