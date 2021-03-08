var campaignModel = require('../models/campaignModel')

exports.getCampaigns = async function() {
    return await campaignModel.campaigns()
}