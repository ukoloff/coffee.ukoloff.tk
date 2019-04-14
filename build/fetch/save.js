const fs = require('fs')
const path = require('path')
const https = require('https')

module.exports = save
const root = save.root = path.join(__dirname, '../../js')

// https://stackoverflow.com/a/40639733
https.globalAgent.maxSockets = 5
https.globalAgent.keepAlive = true

function save(bundle) {

}
