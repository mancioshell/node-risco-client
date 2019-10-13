const riscoClient = require('../node-risco-client')
const moment = require('moment');
const config = require('./config.json')
moment.locale(config.languageId);

const main = async () => {
    const client = riscoClient(config)

    let zones = await client.getZones()
    console.log(zones)

    let partitions = await client.getPartitions()
    console.log(partitions)

    const threeDaysAgo = moment().subtract(3, 'd')
    let events = await client.getEvents(threeDaysAgo, 100)
    console.log(events)

    let result = await client.disarm()
    console.log(result)
}

main()