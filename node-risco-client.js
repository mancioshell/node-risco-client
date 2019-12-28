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
    }

    const _setAlarmState = async (state, partitionId) => {
        if (!logged) await _login()
        const result = await riscoClient.setAlarm(accessToken, sessionId, siteId, state, partitionId)
        return result
    }

    const getPartitions = async () => {
        if (!logged) await _login()
        const { partitions } = await riscoClient.getState(accessToken, sessionId, siteId)
        return partitions
    }

    const getZones = async () => {
        if (!logged) await _login()
        const { zones } = await riscoClient.getState(accessToken, sessionId, siteId)
        return zones
    }

    const getEvents = async (newerThan, count) => {
        if (!logged) await _login()
        const { events } = await riscoClient.getEvents(accessToken, sessionId, siteId, newerThan, count)
        return events
    }

    const disarm = async (partitionId) => {
        if (!logged) await _login()
        return _setAlarmState(DISARMED, partitionId)
    }

    const arm = async (partitionId) => {
        if (!logged) await _login()
        return _setAlarmState(ARMED, partitionId)
    }

    const partiallyArm = async (partitionId) => {
        if (!logged) await _login()
        return _setAlarmState(PARTIALLY_ARMED, partitionId)
    }

    return { getPartitions, getZones, getEvents, disarm, arm, partiallyArm }

}