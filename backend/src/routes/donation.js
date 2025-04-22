const express = require("express");
const { createDonation, getDonations, getDonation, getUserDonations } = require("../controllers/donation");
const { authMiddleware } = require("../middlewares/auth");
const {upload} = require("../middlewares/cloudinary");

const router = express.Router();

router.get("/", authMiddleware,getDonations);
router.get("/myDonations",authMiddleware,getUserDonations);
router.post("/donate", authMiddleware,upload.array("images", 3), createDonation);
router.get("/:id", authMiddleware,getDonation);

module.exports = router;
