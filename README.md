## Install

```
npm install --save node-risco-client
```

## Configuration

Create a file config.json in your project directory.

```
{
    "username": "YOUR_RISCO_EMAIL",
    "password": "YOUR_RISCO_PASSWORD",
    "pin": "YOUR_CENTRAL_PIN_CODE",
    "languageId": "YOUR_LANGUAGE_ID" // example: en, it, de etc ...
}

```

## Usage

Following are super simple examples to use riscoClient.

### Get the partitions

```
const riscoClient = require('node-risco-client')
const config = require('./config.json')

const main = async () => {
    const client = riscoClient(config)   
    let partitions = await client.getPartitions()   
    console.log(partitions) // Print the partitions
}

main()
```

### Get the zones

```
const riscoClient = require('node-risco-client')
const config = require('./config.json')

const main = async () => {
    const client = riscoClient(config)
    let zones = await client.getZones()
    console.log(zones) // print the zones
}

main()
```

### Get all the past events from a start date

```
const riscoClient = require('node-risco-client')
const moment = require('moment');
const config = require('./config.json')
moment.locale(config.languageId);

const main = async () => {
   const threeDaysAgo = moment().subtract(3, 'd')
   let events = await client.getEvents(threeDaysAgo, 100)
   console.log(events)
}

main()
```

### How to arm the alarm panel

```
const riscoClient = require('node-risco-client')
const config = require('./config.json')

const main = async () => {
    const client = riscoClient(config)
    let result = await client.arm()
    console.log(result) // Print zones and partitions
}

main()
```

### How to partially arm the alarm panel

```
const riscoClient = require('node-risco-client')
const config = require('./config.json')

const main = async () => {
    const client = riscoClient(config)
    let result = await client.partiallyArm()
    console.log(result) // Print zones and partitions
}

main()
```

### How to disarm the alarm panel

```
const riscoClient = require('node-risco-client')
const config = require('./config.json')

const main = async () => {
    const client = riscoClient(config)
    let result = await client.disarm()
    console.log(result) // Print zones and partitions
}

main()
```