const Donation = require("../models/Donation");
const Item = require("../models/Item");
const User = require("../models/User.js")
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
            coordinates: { lat, lng },
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
            },
            { new: true }
        );

        res.status(201).json({ message: "Donation created successfully", donation });
    } catch (error) {
        console.error("Error creating donation:", error);
        res.status(500).json({ message: "Error creating donation", error });
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

module.exports = {
    createDonation,
    getDonations
};
