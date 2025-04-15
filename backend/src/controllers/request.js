const Item = require("../models/Item");
const Request = require("../models/Request");
const Donation = require("../models/Donation");
const User = require("../models/User");

const createRequest = async (req, res) => {
    try {
        const { itemType, description, quantity, condition, urgency } = req.body;

        const user = await User.findById(req.user.id);
        const { lat, lng } = user.coordinates;

        const newRequest = new Request({
            userId: req.user.id,
            itemType,
            description,
            quantity,
            condition,
            urgency,
            status: "pending",
            coordinates: { lat, lng }
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

const getRequestsByFilters = async (req, res) => {
    try {
        const donor = await User.findById(req.user._id);
        if (!donor || !donor.address?.coordinates) {
            return res.status(400).json({ message: "User location not found" });
        }

        const donorLat = donor.address.coordinates.lat;
        const donorLng = donor.address.coordinates.lng;

        const { condition = "any", urgency = "medium", maxDistance = 50000, page = 1, limit = 10 } = req.query;

        // Build the filtering conditions
        const filterConditions = { condition, urgency, status: "pending" };

        let requests = await Request.find(filterConditions).populate("userId", "name");

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

        // Filter by distance
        const maxDistanceNum = parseFloat(maxDistance);
        requests = requests.filter(request => request._doc.distance <= maxDistanceNum);

        // Sort by distance
        requests.sort((a, b) => a._doc.distance - b._doc.distance);

        // Pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const paginatedRequests = requests.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            totalRequests: requests.length,
            page: parseInt(page),
            limit: parseInt(limit),
            requests: paginatedRequests
        });
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

        const requestLat = request.coordinates.lat;
        const requestLng = request.coordinates.lng;

        const allConditions = ["new", "like new", "mildly used", "heavily used", "needs repair"];

        let matchCondition = {
            category: request.itemType,
            status: "available",
        };

        const pipeline = [];

        if (request.description) {
            const words = request.description.split(/\s+/).filter(word => word.length > 2);

            pipeline.push({
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

        pipeline.push({ $match: matchCondition });

        const requestedCondition = request.condition.toLowerCase();

        pipeline.push({
            $addFields: {
                matchScore: { $meta: "searchScore" },
                conditionPriority: {
                    $switch: {
                        branches: allConditions.map((cond, index) => ({
                            case: { $eq: ["$condition", cond] },
                            then: 5 - Math.abs(index - allConditions.indexOf(requestedCondition))
                        })),
                        default: 0
                    }
                }
            }
        });

        pipeline.push({ $sort: { conditionPriority: -1, matchScore: -1 } });

        const matchingItems = await Item.aggregate(pipeline);
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
            if (donation.donorId?.coordinates) {
                donation._doc.distance = calculateDistance(
                    requestLat,
                    requestLng,
                    donation.donorId.coordinates.lat,
                    donation.donorId.coordinates.lng
                );
            } else {
                donation._doc.distance = Infinity;
            }
            return donation;
        });

        const maxDistanceNum = parseFloat(maxDistance);
        matchingDonations = matchingDonations.filter(donation => donation._doc.distance <= maxDistanceNum);

        matchingDonations.sort((a, b) => a._doc.distance - b._doc.distance);

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
    getRequestsByFilters
};
