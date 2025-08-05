const express = require("express");
const { getAdminDashboardStats , toggleUserStatus } = require("../controllers/adminController");
const { protect } = require("../controllers/authController");


const router = express.Router();

router.get("/dashboard/stats", protect, getAdminDashboardStats);
router.patch("/users/:id/toggle-status", protect, toggleUserStatus  );

module.exports = router;
