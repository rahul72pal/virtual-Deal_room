const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const Server  = require("socket.io").Server;
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dealRoutes = require("./routes/Deal");
const bidRoutes = require("./routes/bid");
const messageRoutes = require("./routes/message");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const Message = require("./models/Message");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/bid", bidRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));

// Define a root route
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
  },
});

// ✅ Attach io instance to app for route handlers to access
app.set("io", io);

// Socket.io Logic for real-time chat and notifications
io.on("connection", (socket) => {
  console.log("New WebSocket connection:", socket.id);

  // Join a specific deal chat room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    io.emit("message", `User joined room: ${roomId}`);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, senderId, reciverId, content }) => {
    try {
        const message = new Message({ deal: roomId, sender: senderId, reciver: reciverId, content });
        await message.save();
        await message.populate("sender", "name email");

        io.to(roomId).emit("receiveMessage", message);
        io.to(reciverId).emit("receiveMessage", message); // Notify recipient
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
});


  // Notify when a bid is placed
  socket.on("placeBid", ({ dealId, buyerId, offeredPrice }) => {
    io.to(dealId).emit("newBid", { buyerId, offeredPrice });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Define the PORT
const PORT = process.env.PORT || 5000;

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
