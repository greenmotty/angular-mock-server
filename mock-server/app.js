const express = require('express');
const path = require('path');
const lodash = require('lodash');
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '50mb',extended: true})); // for parsing application/x-www-form-urlencoded


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

let fs = require('fs');
let mocks = require('./mocks-config');
let routeKeys = Object.keys(mocks);

routeKeys.forEach(function (key, idx) {
    routeKeys[idx] = routeKeys[idx]
        .replace(/[/?]/g, '.')
        .replace(/{}/g, '([\\w-]+)')
    ;
    routeKeys[idx] = '^' + routeKeys[idx] + '$';
});


let matchedJsonMap = new Map;

function mockStaticFiles(req, res, next) {
    console.log('req.url', req.originalUrl);
    const url = req.originalUrl;
    let matchedJson = null;
    let matchedMock = null;

    for (const path in mocks) {
        if (mocks.hasOwnProperty(path)) {
            const pathIdx = Object.keys(mocks).indexOf(path);
            if (new RegExp(routeKeys[pathIdx]).test(url)) {
                matchedMock = mocks[path];
                var mockJson = matchedMock.mockJson;
                if (!matchedJsonMap.has(mockJson)) {
                    var file = '../mock-server/mocks/' + mockJson + '.json';
                    console.log('mock file', file);
                    try {
                        matchedJson = JSON.parse(fs.readFileSync(file, 'utf8'));
                    } catch (e) {
                        console.error('Error loading mock file: ', file);
                        return res.sendStatus(404);
                    }
                    console.log('Returning mock json: ' + url);
                    if (matchedMock.randomizeData) {
                        matchedJson = matchedMock.randomizeData(req, matchedJson);
                    }
                    matchedJsonMap.set(mockJson, matchedJson)
                }
                if (matchedMock[req.method]) {
                    matchedJson = matchedMock[req.method](req, matchedJsonMap, mockJson);
                } else {
                    /*
                    * default method
                    * function (req, matchedJsonMap, mockJson) {
                    *     return matchedJsonMap.get(mockJson);
                    * }
                    * */

                    matchedJson = matchedJsonMap.get(mockJson);
                    console.log("We are here", matchedMock);
                }
            }
        }
    }
    if (matchedJsonMap.has(mockJson)) {
        setTimeout(function () {
            // console.log('matchedMock',matchedMock);
            res.statusCode = matchedMock.statusCode || 200;
            if (matchedMock.statusCode) {
                return res.end(matchedMock.errMsg);
            }
            return res.send(matchedJson);
        }, matchedMock.delay || 0);
    } else {
        return next();
    }
}

app.use('*', mockStaticFiles);
module.exports = app;
