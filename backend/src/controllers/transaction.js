const Transaction = require("../models/Transaction");
const User = require("../models/User");


const createTransaction = async (req, res) => {
    try {
        const { donorId, recipientId, itemId, donationId, requestId } = req.body;

        const transaction = new Transaction({
            donorId,
            recipientId,
            itemId,
            donationId,
            requestId,
            status: "pending",
        });

        await transaction.save();

        await User.findByIdAndUpdate(donorId, { $push: { transactions: transaction._id } });
        await User.findByIdAndUpdate(recipientId, { $push: { transactions: transaction._id } });

        res.status(201).json({ message: "Transaction created", transaction });
    } catch (error) {
        res.status(500).json({ message: "Error creating transaction", error });
    }
};

const getTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findById(transactionId)
            .populate({
                path: 'pickupDetails', 
                select: 'proposedBy location status' 
            });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({
            message: "Transaction details fetched successfully",
            transaction: {
                _id: transaction._id,
                donorId: transaction.donorId,
                recipientId: transaction.recipientId,
                itemId: transaction.itemId,
                donationId: transaction.donationId,
                requestId: transaction.requestId,
                status: transaction.status,
                pickupDetails: transaction.pickupDetails, 
                transactionDate: transaction.transactionDate,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching transaction", error: error.message });
    }
};


const cancelTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        if (transaction.status === "completed") {
            return res.status(400).json({ message: "Cannot cancel a completed transaction" });
        }

        transaction.status = "cancelled";
        await transaction.save();

        res.status(200).json({ message: "Transaction cancelled", transaction });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling transaction", error });
    }
};


const proposePickup = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { location } = req.body;
        const userId = req.user.id;

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        transaction.pickupDetails = {
            proposedBy: userId,
            location,
            status: "pending"
        };

        await transaction.save();

        res.status(200).json({ message: "Pickup proposed", pickupDetails: transaction.pickupDetails });
    } catch (error) {
        res.status(500).json({ message: "Error proposing pickup", error });
    }
};

const respondToPickup = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { response } = req.body;

        if (!["accepted", "rejected"].includes(response)) {
            return res.status(400).json({ message: "Invalid response" });
        }

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        transaction.pickupDetails.status = response;

        if (response === "accepted") {
            transaction.status = "pickup_arranged";
        }

        await transaction.save();
        res.status(200).json({ message: `Pickup ${response}`, transaction });
    } catch (error) {
        res.status(500).json({ message: "Error responding to pickup", error });
    }
};

const completeTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        transaction.status = "completed";
        await transaction.save();

        res.status(200).json({ message: "Transaction marked as completed", transaction });
    } catch (error) {
        res.status(500).json({ message: "Error completing transaction", error });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        await User.findByIdAndUpdate(transaction.donorId, {
            $pull: { transactions: transaction._id },
        });
        await User.findByIdAndUpdate(transaction.recipientId, {
            $pull: { transactions: transaction._id },
        });

        await Transaction.findByIdAndDelete(transactionId);

        res.status(200).json({ message: "Transaction deleted from all users" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting transaction", error: error.message });
    }
};


module.exports = {
    createTransaction,
    proposePickup,
    respondToPickup,
    completeTransaction,
    cancelTransaction,
    getTransaction,
    deleteTransaction
};