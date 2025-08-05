const express = require('express')
const { protect } = require('../controllers/authController')
const { getNotifications, updateNotification } = require('../controllers/notificationController')
const router = express.Router()

router.get('/get-notifications', protect, getNotifications)
router.put('/update-notification/:id', protect, updateNotification)

module.exports = router


