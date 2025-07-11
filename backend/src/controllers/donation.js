const Donation = require("../models/Donation");
const Item = require("../models/Item");
const User = require("../models/User.js")
const Request = require("../models/Request.js")
const { sendNotificationEmail } = require("../utils/mailer.js")
const { cloudinary } = require("../middlewares/cloudinary.js");

const createDonation = async (req, res) => {
    try {
        const { name, category, description, quantity, condition } = req.body;

        if (!name || !category || !quantity || !condition) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const validConditions = ["new", "like new", "mildly used", "heavily used", "needs repair"];
        if (!validConditions.includes(condition)) {
            return res.status(400).json({ message: "Invalid condition value" });
        }

        const imageUrls = req.files?.map(file => file.path) || [];

        const donor = await User.findById(req.user.id);
        const { lat, lng } = donor.coordinates;

        const item = new Item({
            name,
            category,
            description,
            quantity,
            imageUrl: imageUrls,
            condition,
            donorId: req.user.id,
            status: "available"
        });

        await item.save();

        const donation = new Donation({
            donorId: req.user.id,
            itemId: item._id,
            coordinates: {
                type: "Point",
                coordinates: [lng, lat]
            },
            status: "pending"
        });

        await donation.save();

        item.donationId = donation._id;
        await item.save();

        await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {
                    donations: {
                        itemId: item._id,
                        status: "pending"
                    }
                }
            }
        );

        const maxDistanceInMeters = 1000000000;

        const matchingRequests = await Request.find({
            requestType:"public",
            isCompleted:false,
            itemType: category,
            coordinates: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: maxDistanceInMeters
                }
            }
        }).populate("userId");

        for (let request of matchingRequests) {
            const requester = request.userId;

            if (requester?.email) {
                await sendNotificationEmail(
                    requester.email,
                    "🎁 A donation matches your request!",
                    `
Hi ${requester.name},

Good news! A new donation matches your request for "${request.itemType}".

🎁 Donation Details:
- Item: ${item.name}
- Condition: ${item.condition}
- Quantity: ${item.quantity}

📍 Donor's Location: ${donor.address}

You can now propose a pickup location and date.

Thanks for being part of our community!
                    `
                );
            }

            if (donor.email) {
                await sendNotificationEmail(
                    donor.email,
                    "🧡 Your donation has been matched!",
                    `
Hi ${donor.name},

Your donation "${item.name}" was just matched with someone in need!

📝 Request Details:
- Item Type: ${request.itemType}
- Description: ${request.description || "No details provided"}
- Quantity Needed: ${request.quantity}
- Urgency: ${request.urgency.toUpperCase()}

📍 Requester Location: ${requester.address}

Please check your dashboard to view the request and respond.

Thank you for your generosity!
                    `
                );
            }
        }

        res.status(201).json({ message: "Donation created successfully", donation });

    } catch (error) {
        console.error("Error creating donation:", error);
        res.status(500).json({ message: "Error creating donation", error });
    }
};


const getDonation = async (req, res) => {
    try {
        const { id } = req.params;

        const donation = await Donation.findById(id)
            .populate({
                path: "itemId",
                model: "Item"
            })
            .populate({
                path: "donorId",
                model: "User",
                select: "name email coordinates"
            });

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.json(donation);
    } catch (error) {
        console.error("Error fetching donation by ID:", error);
        res.status(500).json({ message: "Error fetching donation", error });
    }
};


const getDonations = async (req, res) => {
    try {
        const {
            category,
            condition,
            search,
            sort = "recent",
            page = 1,
            limit = 10,
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const currentUserId = req.user?._id;

        const matchDonation = {};

        if (currentUserId) {
            matchDonation.donorId = { $ne: currentUserId };
        }

        const matchItem = {};

        if (category) {
            matchItem["itemId.category"] = category;
        }
        if (condition) {
            matchItem["itemId.condition"] = condition;
        }
        if (search) {
            matchItem.$or = [
                { "itemId.name": { $regex: search, $options: "i" } },
                { "itemId.description": { $regex: search, $options: "i" } },
            ];
        }

        let sortOption = {};
        switch (sort) {
            case "recent":
                sortOption["createdAt"] = -1;
                break;
            case "oldest":
                sortOption["createdAt"] = 1;
                break;
            case "name_asc":
                sortOption["itemId.name"] = 1;
                break;
            case "name_desc":
                sortOption["itemId.name"] = -1;
                break;
            default:
                sortOption["createdAt"] = -1;
        }

        const donations = await Donation.aggregate([
            { $match: matchDonation },
            {
                $lookup: {
                    from: "items",
                    localField: "itemId",
                    foreignField: "_id",
                    as: "itemId",
                },
            },
            { $unwind: "$itemId" },
            { $match: matchItem },
            { $sort: sortOption },
            { $skip: skip },
            { $limit: parseInt(limit) },
        ]);

        const totalResults = await Donation.aggregate([
            { $match: matchDonation },
            {
                $lookup: {
                    from: "items",
                    localField: "itemId",
                    foreignField: "_id",
                    as: "itemId",
                },
            },
            { $unwind: "$itemId" },
            { $match: matchItem },
            { $count: "total" },
        ]);

        const total = totalResults[0]?.total || 0;

        res.json({
            donations,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error("Error fetching donations:", error);
        res.status(500).json({ message: "Error fetching donations", error });
    }
};

const getUserDonations = async (req, res) => {
    try {
        const userId = req.user.id;

        const donations = await Donation.find({ donorId: userId })
            .populate({
                path: "itemId",
                model: "Item"
            })
            .sort({ createdAt: -1 });

        res.json({ donations });
    } catch (error) {
        console.error("Error fetching user donations:", error);
        res.status(500).json({ message: "Error fetching user donations", error });
    }
};

module.exports = {
    createDonation,
    getDonations,
    getDonation,
    getUserDonations,
};
