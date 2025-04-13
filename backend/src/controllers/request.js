const Item = require("../models/Item");
const Request = require("../models/Request");
const Donation = require("../models/Donation");
const User = require("../models/User");

const createRequest = async (req, res) => {
    try {
        const { itemType, description, quantity, condition } = req.body;
        const newRequest = new Request({
            userId: req.user.id,
            itemType,
            description,
            quantity,
            condition,
            status: "pending"
        });

        await newRequest.save();

        await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {
                    requests: {
                        itemId: newRequest._id,
                        status: "pending"
                    }
                }
            },
            { new: true }
        );

        res.status(201).json({ message: "Request created successfully", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: "Error creating request", error });
    }
};

const getRequests = async (req, res) => {
    try {
        const requests = await Request.find().populate("userId", "name email address");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching requests", error });
    }
};

const getRequestsByLocation = async (req, res) => {
    try {
        const donor = await User.findById(req.user._id);
        if (!donor || !donor.address?.coordinates) {
            return res.status(400).json({ message: "User location not found" });
        }

        const donorLat = donor.address.coordinates.lat;
        const donorLng = donor.address.coordinates.lng;

        let requests = await Request.find().populate("userId", "name email address");

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const toRad = (angle) => (angle * Math.PI) / 180;
            const R = 6371; 

            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        requests = requests.map((request) => {
            if (request.userId?.address?.coordinates) {
                request._doc.distance = calculateDistance(
                    donorLat,
                    donorLng,
                    request.userId.address.coordinates.lat,
                    request.userId.address.coordinates.lng
                );
            } else {
                request._doc.distance = Infinity;
            }
            return request;
        });

        requests.sort((a, b) => a._doc.distance - b._doc.distance);

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching requests", error });
    }
};


const getMatchingDonations = async (req, res) => {
    try {
        const requestId = req.params.id;
        const { maxDistance = 50000, page = 1, limit = 1 } = req.query;

        const request = await Request.findById(requestId).populate("userId");
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        const requestLat = request.userId.address.coordinates.lat;
        const requestLng = request.userId.address.coordinates.lng;

        let filter = [];

        if (request.description) {
            const words = request.description.split(/\s+/).filter(word => word.length > 2);

            filter.push({
                $search: {
                    index: "items",
                    compound: {
                        should: words.map(word => ({
                            text: {
                                query: word,
                                path: "description",
                                fuzzy: { maxEdits: 1 },
                                score: { boost: { value: 2 } }
                            }
                        })),
                        minimumShouldMatch: 1
                    }
                }
            });
        }

        let matchCondition = {
            category: request.itemType,
            status: "available",
        };

        if (request.condition.toLowerCase() !== "any") {
            matchCondition.condition = request.condition.toLowerCase();
        }

        filter.push({ $match: matchCondition });

        filter.push({
            $addFields: {
                matchScore: { $meta: "searchScore" },
                conditionPriority: {
                    $cond: {
                        if: { $eq: ["$condition", request.condition.toLowerCase()] },
                        then: 2,
                        else: 1
                    }
                }
            }
        });

        filter.push({ $sort: { conditionPriority: -1, matchScore: -1 } });

        const matchingItems = await Item.aggregate(filter);
        if (matchingItems.length === 0) return res.json([]);

        let matchingDonations = await Donation.find({
            itemId: { $in: matchingItems.map(item => item._id) }
        }).populate("donorId itemId", "name address.coordinates description imageUrl");

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const toRad = (angle) => (angle * Math.PI) / 180;
            const R = 6371;

            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) *
                    Math.cos(toRad(lat2)) *
                    Math.sin(dLon / 2) *
                    Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        matchingDonations = matchingDonations.map((donation) => {
            if (donation.donorId?.address?.coordinates) {
                donation._doc.distance = calculateDistance(
                    requestLat,
                    requestLng,
                    donation.donorId.address.coordinates.lat,
                    donation.donorId.address.coordinates.lng
                );
            } else {
                donation._doc.distance = Infinity;
            }
            return donation;
        });

        const maxDistanceNum = parseFloat(maxDistance);
        matchingDonations = matchingDonations.filter(donation => donation._doc.distance <= maxDistanceNum);

        matchingDonations.sort((a, b) => a.distance - b.distance);

        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const paginatedDonations = matchingDonations.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            totalMatches: matchingDonations.length,
            page: parseInt(page),
            limit: parseInt(limit),
            donations: paginatedDonations
        });
    } catch (error) {
        console.error("Error finding matching donations:", error);
        res.status(500).json({ message: "Error finding matching donations", error });
    }
};



module.exports = {
    createRequest,
    getRequests,
    getMatchingDonations,
    getRequestsByLocation
};
