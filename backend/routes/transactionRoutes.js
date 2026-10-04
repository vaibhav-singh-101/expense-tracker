const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const protect = require("../middleware/authmiddleware");


router.get("/", protect, async (req, res) => {

    try {

        const transactions =
            await Transaction.find({
                user: req.userId
            }).sort({
                createdAt: -1
            });

        res.status(200).json(transactions);

    } catch (error) {

        console.error(
            "GET TRANSACTIONS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch transactions",
            error: error.message
        });
    }
});


router.post("/", protect, async (req, res) => {

    try {

        const {
            text,
            amount,
            type,
            category
        } = req.body;

        if (
            !text ||
            !amount ||
            !type ||
            !category
        ) {

            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const transaction =
            await Transaction.create({

                user: req.userId,

                text,

                amount,

                type,

                category
            });

        res.status(201).json(transaction);

    } catch (error) {

        console.error(
            "ADD TRANSACTION ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to add transaction",
            error: error.message
        });
    }
});


router.put("/:id", protect, async (req, res) => {

    try {

        const {
            text,
            amount,
            type,
            category
        } = req.body;

        const transaction =
            await Transaction.findOne({
                _id: req.params.id,
                user: req.userId
            });

        if (!transaction) {

            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        transaction.text = text;
        transaction.amount = amount;
        transaction.type = type;
        transaction.category = category;

        await transaction.save();

        res.status(200).json(transaction);

    } catch (error) {

        console.error(
            "UPDATE TRANSACTION ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to update transaction",
            error: error.message
        });
    }
});


router.delete("/:id", protect, async (req, res) => {

    try {

        const transaction =
            await Transaction.findOne({
                _id: req.params.id,
                user: req.userId
            });

        if (!transaction) {

            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        await transaction.deleteOne();

        res.status(200).json({
            message: "Transaction deleted"
        });

    } catch (error) {

        console.error(
            "DELETE TRANSACTION ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to delete transaction",
            error: error.message
        });
    }
});


module.exports = router;