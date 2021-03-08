const campaignController = require('../controllers/campaign');
var express = require('express');
var router = express.Router();

router.get('/campaigns-status', campaignController.campaigns_status);
router.get('/campaigns', campaignController.campaigns);

module.exports = router;