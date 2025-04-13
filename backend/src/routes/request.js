const express = require("express");
const { 
    createRequest, 
    getRequests,
    getMatchingDonations,
    getRequestsByLocation
    } = require("../controllers/request");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.get("/", getRequests);
router.post("/", authMiddleware, createRequest);
router.get("/matching-donations/:id", authMiddleware, getMatchingDonations);
router.get("/nearbyRequests",authMiddleware,getRequestsByLocation);


module.exports = router;
