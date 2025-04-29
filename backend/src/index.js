const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const userRoute = require("./routes/user");
const donationRoute = require("./routes/donation");
const requestRoute = require("./routes/request");
const transactionRoute = require("./routes/transaction");
const impactRoute = require("./routes/impact");
const notificationRoute = require("./routes/notification");
const messageRoute = require("./routes/message");
const {setSocketIO} = require("./socket");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "https://community-donation-frontend.vercel.app/",
    credentials: true
  }
});
setSocketIO(io);

app.set("io", io);

// MongoDB connection
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("src/uploads")));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use("/api/users", userRoute);
app.use("/api/donations", donationRoute);
app.use("/api/requests", requestRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/impact", impactRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/messages",messageRoute);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(8080, async () => {
  await connect();
  console.log("Server is running on port 8080");
});
