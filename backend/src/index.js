const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const userRoute = require("./routes/user.js");
const http = require("http");
const donationRoute = require("./routes/donation");
const requestRoute = require("./routes/request");
const transactionRoute = require("./routes/transaction");
const impactRoute = require("./routes/impact.js");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

dotenv.config();

//middlewares
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("src/uploads")));
app.use(express.urlencoded({ extended: true }));

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));

//routes
app.use("/api/users", userRoute);
app.use("/api/donations", donationRoute);
app.use("/api/requests", requestRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/impact", impactRoute);

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("connected to mongoDB");
    } catch (error) {
        throw error;
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("mongoDB disconnected");
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });

    socket.on("pickupProposal", (data) => {
        console.log("New pickup proposal:", data);
        io.to(data.donorId).emit("pickupProposalNotification", data);
    });

    socket.on("joinRoom", (userId) => {
        socket.join(userId);
        console.log(`User joined room: ${userId}`);
    });
});

server.listen(8080, async () => {
    await connect();
    console.log("Server running on port 8080");
});
