const request = require('request-promise-native');
const moment = require('moment');

module.exports.login = async (username, password, pin, languageId) => {

    const LOGIN = 'https://www.riscocloud.com/webapi/api/auth/login'
    const GET_ALL = 'https://www.riscocloud.com/webapi/api/wuws/site/GetAll'

    return new Promise(async (resolve, reject) => {
        let { response } = await request({
            method: 'POST',
            url: `${LOGIN}`,
            json: true,
            body: {
                "userName": `${username}`,
                "password": `${password}`
            }
        }).catch(reject)

        const accessToken = response.accessToken

        let info = await request({
            method: 'POST',
            url: `${GET_ALL}`,
            json: true,
            body: {},
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).catch(reject)

        const siteId = info.response[0].id
        const LOGIN_WITH_PIN = `https://www.riscocloud.com/webapi/api/wuws/site/${siteId}/Login`

        request({
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
        }).then(result => {
            const sessionId = result.response.sessionId
            resolve({ accessToken, sessionId, siteId })
        }).catch(reject)
    })
}


module.exports.getState = async (accessToken, sessionToken, siteId) => {

    const GET_STATE = `https://www.riscocloud.com/webapi/api/wuws/site/${siteId}/ControlPanel/GetState`

    return new Promise(async (resolve, reject) => {
        request({
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
        }).then(result => {
            const partitions = result.response.state.status.partitions
            const zones = result.response.state.status.zones

            resolve({ partitions, zones })
        }).catch(reject)
    })
}

module.exports.getEvents = async (accessToken, sessionToken, siteId, newerThan, count) => {   

    const GET_EVENTS = `https://www.riscocloud.com/webapi/api/wuws/site/${siteId}/ControlPanel/GetEventLog`

    return new Promise(async (resolve, reject) => {
        
        if (!moment.isMoment(newerThan)) reject(new Error('No valid date for newerThan argument'))

        request({
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
        }).then(result => {
            const events = result.response.controlPanelEventsList

            resolve({ events })
        }).catch(reject)
    })
}

module.exports.setAlarm = async (accessToken, sessionToken, siteId, status) => {

    const CONTROL_PANEL = `https://www.riscocloud.com/webapi/api/wuws/site/${siteId}/ControlPanel/PartArm`

    return new Promise(async (resolve, reject) => {
        request({
            method: 'POST',
            url: `${CONTROL_PANEL}`,
            json: true,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: {
                "partitions": [
                    {
                        "armedState": `${status}`
                    }
                ],
                "sessionToken": `${sessionToken}`
            }
        }).then(result => {
            const partitions = result.response.partitions
            const zones = result.response.zones
            resolve({ partitions, zones })
        }).catch(reject)
    })
}