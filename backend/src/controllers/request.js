const Item = require("../models/Item");
const Request = require("../models/Request");
const Donation = require("../models/Donation");
const User = require("../models/User");
const { sendNotificationEmail } = require("../utils/mailer");

const createRequest = async (req, res) => {
    try {
        const { itemType, description, quantity, condition, urgency, requestType } = req.body;

        const user = await User.findById(req.user.id);
        const { lat, lng } = user.coordinates;

        const newRequest = new Request({
            userId: req.user.id,
            itemType,
            description,
            quantity,
            condition,
            urgency,
            requestType,
            coordinates: {
                type: "Point",
                coordinates: [lng, lat]
            }
        });

        await newRequest.save();

        await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {
                    requests: {
                        itemId: newRequest._id,
                    }
                }
            }
        );

        if (requestType === "public") {
            const maxDistanceInMeters = 1000000000;

            const matchingDonations = await Donation.find({
                status: "pending",
                coordinates: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lng, lat]
                        },
                        $maxDistance: maxDistanceInMeters
                    }
                }
            }).populate({
                path: "itemId",
                match: { category: itemType }
            }).populate("donorId");

            for (let donation of matchingDonations) {
                if (!donation.itemId) continue;

                if (donation.donorId?.email) {
                    await sendNotificationEmail(
                        donation.donorId.email,
                        "🚨 Someone needs your donation!",
                        `
Hi ${donation.donorId.name},

Your donation "${donation.itemId.name}" has been matched with a nearby request.

📝 Request Details:
- Description: ${newRequest.description || "No additional details provided"}
- Quantity Needed: ${newRequest.quantity}
- Urgency: ${newRequest.urgency.toUpperCase()}

📍 Requester Location: ${user.address}

Please log in to your account to respond to the request.

Thank you,  
The Community Donation Platform Team
                    `
                    );
                }

                if (user.email) {
                    await sendNotificationEmail(
                        user.email,
                        "🎁 A donation matches your request!",
                        `
Hi ${user.name},

We found a donation that matches your request for "${itemType}".

🎁 Donation Details:
- Item: ${donation.itemId.name}
- Condition: ${donation.itemId.condition}
- Quantity: ${donation.itemId.quantity}

📍 Donor Location: ${donation.donorId.address}

You can now propose a pickup location and date.

Thanks for being part of our community!
                    `
                    );
                }
            }
        }

        res.status(201).json({ message: "Request created successfully", request: newRequest });
    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ message: "Error creating request", error });
    }
};

const getRequests = async (req, res) => {
    try {
        const requests = await Request.find({ isCompleted: false, requestType: "public" })
            .populate("userId", "name email address");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching requests", error });
    }
};

const getRequestsByFilters = async (req, res) => {
    try {
        const donor = await User.findById(req.user._id);
        if (!donor || !donor.coordinates) {
            return res.status(400).json({ message: "User location not found" });
        }

        const donorLat = donor.coordinates.lat;
        const donorLng = donor.coordinates.lng;

        const { condition = "any", urgency = "medium", maxDistance = 50000, page = 1, limit = 10 } = req.query;

        const filterConditions = {
            urgency,
            isCompleted: false,
            requestType: "public"
        };

        if (condition !== "any") {
            filterConditions.condition = condition;
        }

        let requests = await Request.find(filterConditions).populate("userId", "name");

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const toRad = (angle) => (angle * Math.PI) / 180;
            const R = 6371;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c * 1000;
        };

        requests = requests.map((request) => {
            const coords = request.coordinates;
            if (coords && coords.lat != null && coords.lng != null) {
                request._doc.distance = calculateDistance(
                    donorLat,
                    donorLng,
                    coords.lat,
                    coords.lng
                );
            } else {
                request._doc.distance = Infinity;
            }
            return request;
        });

        const maxDistanceNum = parseFloat(maxDistance);
        requests = requests.filter(req => req._doc.distance <= maxDistanceNum);

        requests.sort((a, b) => a._doc.distance - b._doc.distance);

        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const paginatedRequests = requests.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            totalRequests: requests.length,
            page: parseInt(page),
            limit: parseInt(limit),
            requests: paginatedRequests
        });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ message: "Error fetching requests", error });
    }
};

const getMatchingDonations = async (req, res) => {
    try {
        const requestId = req.params.id;
        const { maxDistance = 50000, page = 1, limit = 1 } = req.query;

        const request = await Request.findById(requestId).populate("userId");
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (request.requestType !== "public") {
            return res.status(403).json({ message: "Matching is only allowed for public requests" });
        }

        const requestLat = request.coordinates.lat;
        const requestLng = request.coordinates.lng;

        const allConditions = ["new", "like new", "mildly used", "heavily used", "needs repair"];
        const matchCondition = {
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
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
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
        matchingDonations = matchingDonations.filter(d => d._doc.distance <= maxDistanceNum);

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

const getUserRequests = async (req, res) => {
    try {
        const requests = await Request.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate("userId", "name email address");

        res.status(200).json({ total: requests.length, requests });
    } catch (error) {
        console.error("Error fetching user's requests:", error);
        res.status(500).json({ message: "Error fetching user's requests", error });
    }
};

module.exports = {
    createRequest,
    getRequests,
    getMatchingDonations,
    getRequestsByFilters,
    getUserRequests
};
