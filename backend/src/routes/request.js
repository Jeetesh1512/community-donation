const express = require("express");
const {
    createRequest,
    getRequests,
    getMatchingDonations,
    getRequestsByFilters,
    getUserRequests
} = require("../controllers/request");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.get("/", getRequests);
router.post("/createRequest", authMiddleware, createRequest);
router.get("/matching-donations/:id", authMiddleware, getMatchingDonations);
router.get("/getRequests", authMiddleware, getRequestsByFilters);
router.get("/myRequests", authMiddleware, getUserRequests);


module.exports = router;
