const express = require("express");
const { createDonation, getDonations } = require("../controllers/donation");
const { authMiddleware } = require("../middlewares/auth");
const {upload} = require("../middlewares/cloudinary");

const router = express.Router();

router.get("/", authMiddleware,getDonations);
router.post("/donate", authMiddleware,upload.array("images", 3), createDonation);

module.exports = router;
