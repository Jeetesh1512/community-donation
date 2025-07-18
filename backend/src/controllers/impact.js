const Donation = require("../models/Donation");
const Request = require("../models/Request");
const Item = require("../models/Item");
const Transaction = require("../models/Transaction");

const getImpactStats = async (req, res) => {
    try {
        // Count total donations
        const totalDonations = await Donation.countDocuments({});

        // Count total people helped (Transactions with "completed" status)
        const distinctRecipients = await Transaction.distinct("recipientId", {
            status: { $in: ["completed", "pickup_arranged"] }
        });

        const totalPeopleHelped = distinctRecipients.length;

        // Count total distinct donors
        const totalDonors = await Donation.distinct("donorId");
        const distinctDonors=totalDonors.length;

        // Aggregate total quantity of donated items
        const donatedItems = await Item.aggregate([
            { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } } // Sum the quantities
        ]);

        const totalQuantityDonated = donatedItems[0]?.totalQuantity || 0;

        // Return the impact stats
        res.json({
            totalDonations,
            totalPeopleHelped,
            distinctDonors,
            totalQuantityDonated,
        });
    } catch (error) {
        console.error("Error fetching impact stats:", error);
        res.status(500).json({ message: "Error fetching impact stats", error });
    }
};

module.exports = { getImpactStats };
