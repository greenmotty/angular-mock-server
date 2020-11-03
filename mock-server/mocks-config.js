const lodash = require('lodash');
const moment = require('moment');
const mockUtils = require('./mockUtils');

const urls = {
    '/example': {
        'mockJson': 'dummy.pagination',
        GET: function (req, matchedJsonMap, mockJson) {
            return matchedJsonMap.get(mockJson);
        },
        POST: function (req, matchedJsonMap, mockJson) {
            const data = matchedJsonMap.get(mockJson);
            const bodyData = req.body;
            bodyData.id = data[data.length - 1].id + 1;
            data.push(bodyData);
            matchedJsonMap.set(mockJson, data);
            return bodyData;
        },
    },
    '/example?id=([0-9]+)': {
        'mockJson': 'dummy.pagination',
        GET: function (req, matchedJsonMap, mockJson) {
            const data = matchedJsonMap.get(mockJson);
            return lodash.find(data, {'id': parseInt(req.query.id)});
        },
        DELETE: function (req, matchedJsonMap, mockJson) {
            let data = matchedJsonMap.get(mockJson);
            const rData = lodash.find(data, {'id': parseInt(req.query.id)});
            data = lodash.reject(data, rData);
            matchedJsonMap.set(mockJson, data);
            return rData;
        },
        PUT: function (req, matchedJsonMap, mockJson) {
            const data = matchedJsonMap.get(mockJson);
            const rData = lodash.find(data, {'id': parseInt(req.query.id)});
            const bodyData = req.body;
            Object.assign(rData, bodyData);
            matchedJsonMap.set(mockJson, data);
            return rData;
        }
    }
};

module.exports = urls;
