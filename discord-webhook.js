const { Webhook } = require('discord-webhook-node')
const creds = require('./credentials.json')

let hook = new Webhook(creds.webhook.url)


module.exports = {
    success: function (title, fieldName, fieldValue, inline) {
        hook.success(title, fieldName, fieldValue, inline)
    },
    info: function (title, fieldName, fieldValue, inline) {
        hook.info(title, fieldName, fieldValue, inline)
    },
    warn: function (title, fieldName, fieldValue, inline) {
        hook.warning(title, fieldName, fieldValue, inline)
    },
    err: function (title, fieldName, fieldValue, inline) {
        hook.error(title, fieldName, fieldValue, inline)
    }
}