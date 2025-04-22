const Message = require("../models/Message");
const Transaction = require("../models/Transaction");
const { getSocketIO } = require("../socket");

const getMessagesByTransaction = async (req, res) => {
    const { transactionId } = req.params;

    try {
        const messages = await Message.find({ transaction: transactionId })
            .sort({ timestamp: 1 })
            .populate("sender", "name _id")
            .populate("receiver", "name _id");

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch messages", error: err });
    }
};


const sendMessage = async (req, res) => {
    const { transactionId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    try {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const receiverId =
            transaction.recipientId.toString() === senderId.toString()
                ? transaction.donorId
                : transaction.recipientId;

        let newMessage = await Message.create({
            transaction: transactionId,
            sender: senderId,
            receiver: receiverId,
            content,
        });

        newMessage = await newMessage.populate("sender", "name _id");

        const io = getSocketIO();
        io.to(senderId.toString()).emit("newMessage", newMessage);
        io.to(receiverId.toString()).emit("newMessage", newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: "Message sending failed", error: err });
    }
};

const markMessagesAsRead = async (req, res) => {
    const { transactionId } = req.params;
    const userId = req.user._id;

    try {
        const updated = await Message.updateMany(
            {
                transaction: transactionId,
                receiver: userId,
                read: false
            },
            { $set: { read: true } }
        );

        res.status(200).json({ message: "Messages marked as read", updatedCount: updated.modifiedCount });
    } catch (err) {
        res.status(500).json({ message: "Failed to mark messages as read", error: err });
    }
};

module.exports = {
    getMessagesByTransaction,
    sendMessage,
    markMessagesAsRead
};