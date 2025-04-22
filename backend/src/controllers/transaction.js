const Transaction = require("../models/Transaction");
const Request = require("../models/Request");
const User = require("../models/User");
const Notification = require("../models/Notification")
const { sendNotificationEmail } = require("../utils/mailer.js");

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
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction details fetched",
      transaction
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
    const { location, pickupDateTime } = req.body;
    const userId = req.user?.id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const user = await User.findById(userId);
    const userName = user?.name || "Someone";

    transaction.pickupDetails = {
      proposedBy: userId,
      location,
      pickupDateTime: new Date(pickupDateTime),
      status: "pending"
    };

    await transaction.save();

    const donor = await User.findById(transaction.donorId);

    const notification = new Notification({
      userId: transaction.donorId,
      message: `New pickup proposed by ${userName}`,
      transactionId: transaction._id,
      type: "pickupProposal",
    });

    await notification.save();

    const io = req.app.get("io");
    io.to(transaction.donorId.toString()).emit("pickupProposalNotification", {
      message: `New pickup proposed by ${userName}!`,
      transactionId: transaction._id,
      location,
      pickupDateTime,
    });

    if (donor?.email) {
      const subject = "New Pickup Proposal for Your Donation";
      const text = `${userName} has proposed a pickup.\n\nPickup Location: ${location.address}\nPickup Date & Time: ${new Date(pickupDateTime).toLocaleString()}\n\nPlease log in to respond.`;
      await sendNotificationEmail(donor.email, subject, text);
    }

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

      const request = await Request.findById(transaction.requestId);
      if (request) {
        request.status = "matched";
        await request.save();
      }
    }

    await transaction.save();

    const proposerId = transaction.pickupDetails.proposedBy?.toString();
    const proposer = await User.findById(proposerId);

    const notification = new Notification({
      userId: proposerId,
      message: `Your pickup proposal has been ${response}`,
      transactionId: transaction._id,
      type: "responseToPickup",
    });

    await notification.save();

    const io = req.app.get("io");
    io.to(proposerId).emit("pickupResponseNotification", {
      message: `Pickup proposal ${response}`,
      transactionId: transaction._id,
      response,
    });

    if (proposer?.email) {
      const subject = `Pickup Proposal ${response}`;
      const text = `Hi ${proposer.name || "User"},\n\nYour pickup proposal for transaction ${transaction._id} has been ${response} by the donor.\n\nStatus: ${transaction.status}\n\nPlease log in to view more details.`;
      await sendNotificationEmail(proposer.email, subject, text);
    }

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

    const request = await Request.findById(transaction.requestId);
    if (request) {
      request.fulfilledQuantity += 1;

      if (request.fulfilledQuantity >= request.quantity) {
        request.isCompleted = true;
      }

      await request.save();
    }

    res.status(200).json({ message: "Transaction marked as completed", transaction });
  } catch (error) {
    res.status(500).json({ message: "Error completing transaction", error });
  }
};


const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

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

const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({
      $or: [
        { donorId: userId },
        { recipientId: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("donationId")
      .populate("requestId")
      .populate("itemId");

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found for this user" });
    }

    res.status(200).json({
      message: "User transactions fetched successfully",
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user transactions", error: error.message });
  }
};


module.exports = {
  createTransaction,
  getTransaction,
  cancelTransaction,
  proposePickup,
  respondToPickup,
  completeTransaction,
  deleteTransaction,
  getUserTransactions
};
