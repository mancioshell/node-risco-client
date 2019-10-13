const riscoClient = require('./lib')

module.exports = (config) => {

    const ARMED = 3
    const DISARMED = 1
    const PARTIALLY_ARMED = 2

    let accessToken, sessionId, siteId, logged
    let { username, password, pin, languageId} = config

    const login = async () => {
        return new Promise(async (resolve, reject) => {
            riscoClient.login(username, password, pin, languageId).catch(error => {
                throw new Error(error)
            }).then(result => {
                accessToken = result.accessToken
                sessionId = result.sessionId
                siteId = result.siteId
                logged = true
                resolve({ accessToken, sessionId })
            }).catch(reject)
        })
    }

    const setAlarmState = async (state) => {

        if (!logged) await login()

        const result = await riscoClient.setAlarm(accessToken, sessionId, siteId, state).catch(error => {
            throw new Error(error)
        })

        return result
    }

    const getPartitions = async () => {

        if (!logged) await login()

        const { partitions } = await riscoClient.getState(accessToken, sessionId, siteId).catch(error => {
            throw new Error(error)
        })

        return partitions
    }

    const getZones = async () => {

        if (!logged) await login()

        const { zones } = await riscoClient.getState(accessToken, sessionId, siteId).catch(error => {
            throw new Error(error)
        })

        return zones
    }

    const getEvents = async (newerThan, count) => {

        if (!logged) await login()

        const { events } = await riscoClient.getEvents(accessToken, sessionId, siteId, newerThan, count).catch(error => {
            throw new Error(error)
        })

        return events
    }

    const disarm = async () => {

        if (!logged) await login()
        return setAlarmState(DISARMED)
    }

    const arm = async () => {
        if (!logged) await login()
        return setAlarmState(ARMED)
    }

    const partiallyArm = async () => {
        if (!logged) await login()
        return setAlarmState(PARTIALLY_ARMED)
    }

    return { getPartitions, getZones, getEvents, disarm, arm, partiallyArm }

}

