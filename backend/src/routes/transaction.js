const express = require("express");
const router = express.Router();
const {
    createTransaction,
    proposePickup,
    respondToPickup,
    completeTransaction,
    getTransaction,
    deleteTransaction
} = require("../controllers/transaction");
const {authMiddleware} = require("../middlewares/auth");


router.post("/createTransaction",authMiddleware,createTransaction);
router.post("/proposePickup/:transactionId",authMiddleware,proposePickup);
router.post("/respondToPickup/:transactionId",authMiddleware,respondToPickup);
router.post("/completeTransaction/:transactionId",authMiddleware,completeTransaction);
router.get("/getTransaction/:transactionId",authMiddleware,getTransaction);
router.delete("/deleteTransaction/:transactionId",authMiddleware,deleteTransaction);

module.exports = router;