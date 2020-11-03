const lodash = require('lodash');
const moment = require('moment');
const generateLoadingData = true;

/**
 *
 * @param contentData   Content part of data
 * @param paramToPathMap  The request parameter corresponds to the path. example:{param1:path1,param2:path2}
 * @param param  Requested parameter value
 * @param filterValue  Value brought by the request or converted value
 * @returns {Array}
 */
const filterFunction = (contentData,paramToPathMap,param,filterValue) => {
    let path = lodash.get(paramToPathMap,param);
    return lodash.filter(contentData,function (o) {
        return lodash.isEqual(lodash.get(o,path),filterValue);
    });
};

/**
 *
 * @param contentData
 * @param paramToPathMap
 * @param param
 * @param filterValue
 * @param isfromDate
 * @returns {Array}
 */
const filterDate = (contentData, paramToPathMap, param, filterValue, isfromDate) => {
    let path = lodash.get(paramToPathMap, param);
    let filterTime = moment(parseFloat(filterValue));
    let bTime = moment(new Date(filterTime)).format('YYYY-MM-DD');
    return lodash.filter(contentData, function (o) {
        let time = lodash.get(o, path);
        let aTime = moment(new Date(time)).format('YYYY-MM-DD');
        if (isfromDate)
            return moment(bTime).isBefore(aTime);
        else
            return moment(aTime).isBefore(bTime);
    });
};

const filterByDate = (data, reqQuery, queryParam, dataParam, isBefore) => {
    const date = lodash.get(reqQuery, queryParam);
    const filterTime = moment(parseFloat(date));
    const bTime = moment(new Date(filterTime)).format('YYYY-MM-DD');
    return lodash.filter(data, function (o) {
        const aDate = lodash.get(o, dataParam);
        const aTime = moment(new Date(aDate)).format('YYYY-MM-DD');
        return isBefore ? moment(aTime).isSameOrBefore(bTime) : moment(aTime).isSameOrAfter(bTime) ;
    });
};

/**
 *
 * @param contentData
 * @returns {{number: number, last: boolean, numberOfElements: *, size: number, totalPages: number, content: *, first: boolean, totalElements: *}}
 */
const rePackageDataFunction = function rePackageData(req, contentData) {
    let reqQuery = req.query;
    let page = 0;
    let size = 100;
    let totalElements = contentData.length;

    if (lodash.has(reqQuery, 'page')) {
        page = parseInt(lodash.get(reqQuery, 'page'));
    }
    if (lodash.has(reqQuery, 'size')) {
        size = parseInt(lodash.get(reqQuery, 'size'));
    }
    contentData = lodash.slice(contentData, page * size, (page + 1) * size);
    let totalPages = Math.ceil(totalElements / size);
    let isFirstPage = (page === 0);
    let isLastPage = (page === (totalPages - 1));
    return {
        "content": contentData,
        "last": isLastPage,
        "totalPages": totalPages,
        "totalElements": totalElements,
        "numberOfElements": size,
        "first": isFirstPage,
        "size": size,
        "number": page
    };
};

const defaultRespData = () => {
    return {
        "content": [],
        "totalPages": 0,
        "totalElements": 0,
        "numberOfElements": 0,
        "first": true,
        "last": true,
        "size": 0,
        "number": 0
    };
};

const getLength = (data) => {
    return lodash.get(data, 'length', 0);
};

const getData = (matchedJsonMap, mockJson) => {
    return matchedJsonMap.get(mockJson);
};

const getContentData = (matchedJsonMap, mockJson) => {
    return lodash.get(matchedJsonMap.get(mockJson), 'content', []);
};

const getDataList = (req, matchedJsonMap, mockJson, filter = null) => {
    let content = getContentData(matchedJsonMap, mockJson);
    const totalElements = getLength(content);
    if (totalElements === 0) {
        return defaultRespData();
    }

    if (filter) {
        content = filter(req, content);
        const filterTotalElements = getLength(content);
        console.log('########## filterTotalElements', filterTotalElements);
        if (filterTotalElements === 0) {
            return defaultRespData();
        }
    }

    const reqQuery = req.query;
    const page = lodash.get(reqQuery, 'page',  1);
    const size = parseInt(lodash.get(reqQuery, 'size', 100));
    const leftIndex = page * size;
    content = lodash.drop(content, leftIndex);
    content = lodash.take(content, size);
    const numberOfElements = getLength(content);
    const totalPages = numberOfElements === 0 ? 0: Math.ceil(totalElements / numberOfElements);
    console.log('##########', `page:${page} -- size:${size} -- leftIndex:${leftIndex} -- totalElements:${totalElements} -- numberOfElements:${numberOfElements} -- totalPages:${totalPages}`);

    return lodash.merge(defaultRespData(), {
        "content": content,
        "totalPages": totalPages,
        "totalElements": totalElements,
        "numberOfElements": numberOfElements,
        "first": page === 1,
        "last": page * size >= totalElements,
        "size": 100,
        "number": 0
    });
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const cloneContent = (response, times) => {
    const data = response;
    const content = data.content || data;
    const size = content.length - 1;
    data.totalEelements = data.totalElements || 0;
    if (generateLoadingData) {
        for (let i = 0; i < times; i++) {
            const index = getRandomInt(0, size);
            const itemTemplate = content[index];
            const item = lodash.cloneDeep(itemTemplate);
            data.totalElements++;
            content.push(item);
        }
    }
    return data;
};

const deleteByOidByPost = (req, matchedJsonMap, mockJson) => {
    const data = matchedJsonMap.get(mockJson);
    const bodyData = req.body;
    const rData = [];
    lodash.forEach(bodyData, (id) => {
        const rData = lodash.find(data.content, {'oid': parseInt(id)});
        data.content = lodash.reject(data.content, rData);
        rData.push(rData);
    });
    matchedJsonMap.set(mockJson, data);
    return rData;
};

const addReqDataByPost = (req, matchedJsonMap, mockJson) => {
    return addDataByPost(req.body, matchedJsonMap, mockJson);
};

const addDataByPost = (data, matchedJsonMap, mockJson) => {
    const dbData = matchedJsonMap.get(mockJson);
    const list = dbData.content;
    let id = 0;
    let idName;
    for (let i = 0; i < list.length; i++) {
        idName = getIdName(list[i]);
        let idInDB = lodash.get(list[i], idName, 0);
        if (id < idInDB) {
            id = idInDB;
        }
    }
    data[idName] = id + 1;
    dbData.content.push(data);
    matchedJsonMap.set(mockJson, dbData);
    return data;
};

const editReqDataByID = (req, matchedJsonMap, mockJson) => {
    return editDataByID(req.body, matchedJsonMap, mockJson);
};

const editDataByID = (data, matchedJsonMap, mockJson) => {
    const dbData = matchedJsonMap.get(mockJson);
    const list = dbData.content;
    let idName;
    for (let i = 0; i < list.length; i++) {
        idName = getIdName(list[i]);
        let idInDB = lodash.get(list[i], idName, 0);
        if (data[idName] === idInDB) {
            Object.assign(list[i], data); // Edit
            matchedJsonMap.set(mockJson, dbData);
            return data;
        }
    }
    return null;
};

const editContentDataById = (req, matchedJsonMap, mockJson) => {
    const dbData = matchedJsonMap.get(mockJson);
    const data = req.body;
    let idName;
    idName = getIdName(dbData);
    let idInDB = lodash.get(dbData, idName, 0);
    if (data[idName] === idInDB) {
        Object.assign(dbData, data); // Edit
        matchedJsonMap.set(mockJson, dbData);
        return data;
    }
    return null;
};

const getIdName = (data) => {
    if ('id' in data) {
        return 'id';
    } else if ('oid' in data) {
        return 'oid';
    } else {
        return 'unknown';
    }
};

const getQueryVariable = (variable, url) => {
    const urls = lodash.split(url, '?');
    const variables = urls[urls.length - 1];
    const vars = variables.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if(pair[0] === variable) {
            return pair[1];
        }
    }
    return false;
};


module.exports = {
    "filter": filterFunction,
    "filterDate": filterDate,
    "rePackageData": rePackageDataFunction,
    "defaultRespData": defaultRespData,
    "getLength": getLength,
    "filterByDate": filterByDate,
    "getData": getData,
    "getContentData": getContentData,
    "getDataList": getDataList,
    "getRandomInt": getRandomInt,
    "cloneContent": cloneContent,
    "deleteByOidByPost": deleteByOidByPost,
    'addDataByPost': addDataByPost,
    'addReqDataByPost': addReqDataByPost,
    'editReqDataByID': editReqDataByID,
    'editDataByID': editDataByID,
    'getQueryVariable': getQueryVariable,
    'editContentDataById': editContentDataById
};
