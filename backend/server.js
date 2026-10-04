const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

const transactionRoutes =
    require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Expense Tracker API is running");
});

// Transaction API
app.use(
    "/api/transactions",
    transactionRoutes
);

// Connect MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB Connected");

        app.listen(5000, () => {
            console.log(
                "Server running on http://localhost:5000"
            );
        });

    })
    .catch((error) => {
        console.error(
            "MongoDB connection error:",
            error
        );
    });