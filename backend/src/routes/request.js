const express = require("express");
const { 
    createRequest, 
    getRequests,
    getMatchingDonations,
    getRequestsByFilters
    } = require("../controllers/request");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.get("/", getRequests);
router.post("/createRequest", authMiddleware, createRequest);
router.get("/matching-donations/:id", authMiddleware, getMatchingDonations);
router.get("/getRequests",authMiddleware,getRequestsByFilters);


module.exports = router;
