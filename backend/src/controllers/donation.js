const Donation = require("../models/Donation");
const Item = require("../models/Item");
const { cloudinary } = require("../middlewares/cloudinary.js");

const createDonation = async (req, res) => {
    try {
        const { name, category, description, quantity, condition } = req.body;

        const imageUrls = req.files.map(file => file.path);

        const item = new Item({
            name,
            category,
            description,
            quantity,
            imageUrl: imageUrls,
            condition,
            donorId: req.user.id,
            status: "available",
        });

        await item.save();

        const donation = new Donation({
            donorId: req.user.id,
            itemId: item._id,
            status: "pending",
        });

        await donation.save();

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
        res.status(500).json({ message: "Error creating donation", error });
    }
};

const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find().populate("itemId");
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching donations", error });
    }
};

module.exports = {
    createDonation,
    getDonations
};
