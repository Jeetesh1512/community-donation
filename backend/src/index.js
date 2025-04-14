const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const userRoute = require("./routes/user.js");
const donationRoute = require("./routes/donation");
const requestRoute = require("./routes/request");
const transactionRoute = require("./routes/transaction");

const app = express();

dotenv.config();

//middlewares
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("src/uploads")));
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));

//routes
app.use("/api/users",userRoute);
app.use("/api/donations", donationRoute);
app.use("/api/requests", requestRoute);
app.use("/api/transactions", transactionRoute);

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

app.listen(8080, async () => {
    await connect();
    console.log("server started on port 8080..");
})