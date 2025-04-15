const express = require("express");
const { createDonation, getDonations, getDonation } = require("../controllers/donation");
const { authMiddleware } = require("../middlewares/auth");
const {upload} = require("../middlewares/cloudinary");

const router = express.Router();

router.get("/", authMiddleware,getDonations);
router.get("/:id", authMiddleware,getDonation);
router.post("/donate", authMiddleware,upload.array("images", 3), createDonation);

module.exports = router;
