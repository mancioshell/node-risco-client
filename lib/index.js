const request = require('request-promise-native');
const moment = require('moment');

const createUnauthorizedError = message => {
    let err = new Error(message);
    err.statusCode = 401;
    return err
}

module.exports.login = async (username, password, pin, languageId) => {

    const LOGIN = 'https://www.riscocloud.com/webapi/api/auth/login'
    const GET_ALL = 'https://www.riscocloud.com/webapi/api/wuws/site/GetAll'

    let response

    ({ response } = await request({
        method: 'POST',
        url: `${LOGIN}`,
        json: true,
        body: {
            "userName": `${username}`,
            "password": `${password}`
        }
    }))

    const { accessToken } = response
    if (!accessToken) throw new Error('no accessToken has been returned from login request');

    ({ response } = await request({
        method: 'POST',
        url: `${GET_ALL}`,
        json: true,
        body: {},
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    }))

    if (!response || !Array.isArray(response) || response[0] == null || !response[0].id)
        throw new Error('no siteId has been returned from login request');

    const siteId = response[0].id
    const LOGIN_WITH_PIN = `https://www.riscocloud.com/webapi/api/wuws/site/${siteId}/Login`;

    ({ response } = await request({
        method: 'POST',
        url: `${LOGIN_WITH_PIN}`,
        json: true,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: {
            "languageId": `${languageId}-${languageId}`,
            "pinCode": `${pin}`
        }
    }))    

    if (!response || !response.sessionId) throw new Error('no sessionId has been returned from login request')
    const sessionId = response.sessionId   

    return Promise.resolve({ accessToken, sessionId, siteId })
}


module.exports.getState = async (accessToken, sessionToken, siteId) => {

    const GET_STATE = `https://www.riscocloud.com/webapi/api/wuws/site/${siteId}/ControlPanel/GetState`

    let result = await request({
        method: 'POST',
        url: `${GET_STATE}`,
        json: true,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: {
            "fromControlPanel": true,
            "sessionToken": `${sessionToken}`
        }
    })

    if (result.status === 401) throw createUnauthorizedError(result.errorText)

    let response = result.response

    const partitionsPredicate = !response || !response.state || !response.state.status || !response.state.status.partitions
    const zonesPredicate = !response || !response.state || !response.state.status || !response.state.status.zones

    const partitions = partitionsPredicate ? [] : response.state.status.partitions
    const zones = zonesPredicate ? [] : response.state.status.zones

    return Promise.resolve({ partitions, zones })

}

module.exports.getEvents = async (accessToken, sessionToken, siteId, newerThan, count) => {

    const GET_EVENTS = `https://www.riscocloud.com/webapi/api/wuws/site/${siteId}/ControlPanel/GetEventLog`

    if (!moment.isMoment(newerThan)) reject(new Error('No valid date for newerThan argument'))

    let result = await request({
        method: 'POST',
        url: `${GET_EVENTS}`,
        json: true,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: {
            "count": `${count}`,
            "fromControlPanel": true,
            "newerThan": `${newerThan.format()}`,
            "offset": 0,
            "sessionToken": `${sessionToken}`
        }
    })

    if (result.status === 401) throw createUnauthorizedError(result.errorText)

    let response = result.response

    const events = (!response || !response.controlPanelEventsList) ? [] : response.controlPanelEventsList
    return Promise.resolve({ events })
}

module.exports.setAlarm = async (accessToken, sessionToken, siteId, status, partitionId = 0) => {

    const CONTROL_PANEL = `https://www.riscocloud.com/webapi/api/wuws/site/${siteId}/ControlPanel/PartArm`

    let result = await request({
        method: 'POST',
        url: `${CONTROL_PANEL}`,
        json: true,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: {
            "partitions": [
                {
                    "id": partitionId,
                    "armedState": status
                }
            ],
            "sessionToken": `${sessionToken}`
        }
    })

    if (result.status === 401) throw createUnauthorizedError(result.errorText)

    let response = result.response

    const partitions = (!response || !response.partitions) ? [] : response.partitions
    const zones = (!response || !response.zones) ? [] : response.zones
    return Promise.resolve({ partitions, zones })
}