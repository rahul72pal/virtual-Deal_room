const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, getDealMessages, getUserMessages, getDealsWithMessages } = require("../controllers/messageController");

const router = express.Router();

router.get("/deals-with-messages", protect, getDealsWithMessages);
router.post("/:dealId", protect, sendMessage);  // ✅ Send a message in a deal
router.get("/:dealId", protect, getDealMessages); // ✅ Get all messages for a deal
router.get("/user/messages", protect, getUserMessages); // 🔥 Get all messages for a user


module.exports = router;
