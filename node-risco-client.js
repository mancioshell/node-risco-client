const riscoClient = require('./lib')

module.exports = (config) => {

    const ARMED = 3
    const DISARMED = 1
    const PARTIALLY_ARMED = 2

    let accessToken, sessionId, siteId, logged
    let { username, password, pin, languageId } = config
    if (!username) throw new Error('username options is required')
    if (!password) throw new Error('password options is required')
    if (!pin) throw new Error('pin options is required')
    if (!languageId) throw new Error('languageId options is required')

    const _login = async () => {
        ({ accessToken, sessionId, siteId } = await riscoClient.login(username, password, pin, languageId))
        logged = true
        return Promise.resolve({ accessToken, sessionId, siteId })
    }

    const _setAlarmState = async (state, partitionId) => {
        if (!logged) await _login()
        return await riscoClient.setAlarm(accessToken, sessionId, siteId, state, partitionId).catch(error => {
            console.log('refreshing login due to session expired or invalid token')
            if (error.statusCode === 401) { logged = false; return _setAlarmState(state, partitionId) }
            throw new Error(error)
        })
    }

    const getPartitions = async () => {
        if (!logged) await _login()
        let result = await riscoClient.getState(accessToken, sessionId, siteId).catch(error => {
            console.log('refreshing login due to session expired or invalid token')
            if (error.statusCode === 401) { logged = false; return getPartitions() }
            throw new Error(error)
        })

        if (result) return result.partitions
    }

    const getZones = async () => {
        if (!logged) await _login()
        let result = await riscoClient.getState(accessToken, sessionId, siteId).catch(error => {
            console.log('refreshing login due to session expired or invalid token')
            if (error.statusCode === 401) { logged = false; return getZones() }
            throw new Error(error)
        })

        if (result) return result.zones
    }

    const getEvents = async (newerThan, count) => {
        if (!logged) await _login()
        let result = await riscoClient.getEvents(accessToken, sessionId, siteId, newerThan, count).catch(error => {
            console.log('refreshing login due to session expired or invalid token')
            if (error.statusCode === 401) { logged = false; return getEvents(newerThan, count) }
            throw new Error(error)
        })

        if (result) return result.events
    }

    const disarm = async (partitionId) => {
        return _setAlarmState(DISARMED, partitionId)
    }

    const arm = async (partitionId) => {
        return _setAlarmState(ARMED, partitionId)
    }

    const partiallyArm = async (partitionId) => {
        return _setAlarmState(PARTIALLY_ARMED, partitionId)
    }

    return { getPartitions, getZones, getEvents, disarm, arm, partiallyArm }
}