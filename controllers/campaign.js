
var campaignServices = require('../services/campaignService');
var moment = require('moment');
// send campaign data
exports.campaigns = async function(req, res) {
    try {
        let data = await campaignServices.getCampaigns()
        res.json({'error': '', 'data': data.data});
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
}

// send campaign status
exports.campaigns_status = async function(req, res) {
    try {
        let campaigns = await campaignServices.getCampaigns();
        let data = await getCampaignStatus(campaigns.data);
        if (data.error !== '') {
            res.status(400).json({ status: 400, message: data.error });
        } else res.json(data);
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
}


// Determine capmpaign conflicts
var getCampaignStatus = async function (data) {
    let errorMsg = '';
    // Note: - Alternatively Map object can be created 
    var targetsGender = {
        'male': {'gaps': {'periodstart': '', 'lastAssigned': ''}, 'conflicts': {'startRef': '', 'endRef': '', 'nameRef': '', 'confStart': '', 'insert': true}}, 
        'female': {'gaps': {'periodstart': '', 'lastAssigned': ''}, 'conflicts': {'startRef': '', 'endRef': '', 'nameRef': '', 'confStart': '', 'insert': true}}
    };
    var targetsType = {
        'new': {'gaps': {'periodstart': '', 'lastAssigned': ''}, 'conflicts': {'startRef': '', 'endRef': '', 'nameRef': '', 'confStart': '', 'insert': true}}, 
        'old':{'gaps': {'periodstart': '', 'lastAssigned': ''}, 'conflicts': {'startRef': '', 'endRef': '', 'nameRef': '', 'confStart': '', 'insert': true}}
    };
    var targets = Object.assign({}, targetsGender, targetsType);
    var gaps = {};
    var conflicts = {
        'gender': {
            'male': [],
            'female': []
        },
        'customer_type': {
            'old': [],
            'new': []
        }
    };
    function updateGaps (start, end, target) {
        let obj = {
            'start': start,
            'end': end,
            'gender': [],
            'customer_type': []
        }
        let period = start + ' - ' + end
        if (period in gaps) {
            obj = gaps[period]
            if (target in targetsGender) {
                if (!obj['gender'].includes(target)) obj['gender'].push(target)
            } else {
                if (!obj['customer_type'].includes(target)) obj['customer_type'].push(target)
            }
        } else {
            if (target in targetsGender) {
                obj['gender'].push(target);
            } else {
                obj['customer_type'].push(target);
            }
        }
        gaps[period] = obj
    }

    function updateConflict (confStart, campStart, campEnd, camp, target) {
        let initObj = {
            'start': confStart,
            'end': '',
            'camps': [camp, targets[target].conflicts.nameRef]
        }
        let targeting = target in targetsGender ? 'gender' : 'customer_type';
        if (targets[target].conflicts.insert) {
            initObj.end = (targets[target].conflicts.endRef < campEnd) ? targets[target].conflicts.endRef : campEnd;
            conflicts[targeting][target].push(initObj);
            targets[target].conflicts.insert = false;
        } else {
            let conflictObj = conflicts[targeting][target].pop();
            if (targets[target].conflicts.endRef < campEnd) {
                conflictObj.end  = targets[target].conflicts.endRef;
            } else {
                conflictObj.end = conflictObj.end < campEnd ? campEnd : conflictObj.end;
            }
            if (!(conflictObj.camps).includes(camp)) conflictObj['camps'].push(camp);
            conflicts[targeting][target].push(conflictObj);
        }
    }

    function adjustDate (factor, date) {
        let dt = new Date(date);
        dt.setDate(dt.getDate()  + 1 * factor);
        return moment(dt).format('YYYY.MM.DD');
    }
    // Assumption has been made that data will be sorted on start dates and end date
    try {
        for (var i =0; i < data.length; i++) {
            // Intialize data
            let campStart = data[i].start_date;
            let campEnd = data[i].end_date;
            let campTargets = data[i].targeting;
            // calculate for gaps and conflicts for each targets
            for (target in targets) {
                // Calculate gaps for targets based on genders /customer type
                let targetingType = (target in targetsGender) ? 'gender' : 'customer_type'
                if ((campTargets[targetingType]).includes(target)) {
                    if (targets[target].gaps.periodstart !== '' && targets[target].gaps.periodstart < campStart) {
                        // push period as a gap
                        updateGaps(targets[target].gaps.periodstart, campStart, target);
                        //init count
                        targets[target].gaps.periodstart = '';
                    } else if (targets[target].gaps.lastAssigned !== '' && targets[target].gaps.lastAssigned < campStart) {
                        // case when there is gap between two campaigns
                        let gapStart = adjustDate(1, targets[target].gaps.lastAssigned);
                        let gapEnd = adjustDate(-1, campStart);
                        if (gapStart < gapEnd) {
                            updateGaps(gapStart, gapEnd, target);
                        }
                        // push period as a gap
                    }
                    // init last assigned
                    if (targets[target].gaps.lastAssigned === '' || (targets[target].gaps.lastAssigned !== '' && targets[target].gaps.lastAssigned < campEnd)) {
                        targets[target].gaps.lastAssigned = campEnd;
                    }
                    targets[target].gaps.periodstart = '';
                } else {
                    if (targets[target].gaps.periodstart === '') {
                        if (targets[target].gaps.lastAssigned !== '') {
                            targets[target].gaps.periodstart = adjustDate(1,targets[target].gaps.lastAssigned);
                        } else {
                            targets[target].gaps.periodstart = campStart;
                        }
                    } else {
                        // insert for last node
                        if (i === data.length - 1) {
                            // push period as a gap for last node
                            updateGaps(targets[target].gaps.periodstart, campEnd, target);
                        }
                    }
                }
                if ((campTargets[targetingType]).includes(target)) {
                    if (targets[target].conflicts.startRef === '' || campStart >= targets[target].conflicts.endRef) {
                        // init for first assignment or new refrence 
                        if (campStart >= targets[target].conflicts.endRef)  targets[target].conflicts.confStart = '';
                        targets[target].conflicts.nameRef = data[i].name;
                        targets[target].conflicts.startRef = campStart;
                        targets[target].conflicts.endRef = campEnd;
                        targets[target].conflicts.insert = true;
                    } else {
                        // it is a conflict append in existing conflict or add new
                        if(targets[target].conflicts.confStart === '') targets[target].conflicts.confStart = campStart;
                        updateConflict(targets[target].conflicts.confStart, campStart, campEnd,  data[i].name, target);
                        if (targets[target].conflicts.endRef < campEnd) targets[target].conflicts.endRef = campEnd;
                    }
                }
            }
        }
    } catch (e) {
        errorMsg = e;
    }
    return {'error': errorMsg, 'data': {'gaps': gaps, 'conflicts': conflicts}}
}