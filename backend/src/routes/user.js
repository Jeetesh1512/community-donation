const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
} = require("../controllers/user");

const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

//public routes
router.post("/register", registerUser);
router.post("/login", loginUser);


//authenticated routes
router.get("/authCheck", authMiddleware, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});
router.post("/logout", authMiddleware, logoutUser);
router.get("/getUser/:id", authMiddleware, getUser);
router.put("/updateUser/:id", authMiddleware, updateUser);
router.delete("/deleteUser/:id", authMiddleware, deleteUser);

//admin routes
router.get("/getAllUsers", authMiddleware, adminMiddleware, getUsers);


module.exports = router;