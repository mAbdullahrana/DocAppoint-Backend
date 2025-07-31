const express = require('express')
const { createReview , getReview } = require('../controllers/reviewController')

const router = express.Router()

router.post('/', createReview)

router.get('/:appointmentID', getReview)

module.exports = router