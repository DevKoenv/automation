const { Webhook } = require('discord-webhook-node')
const creds = require('./credentials.json')

let hook = new Webhook(creds.webhook.url)

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }
  
module.exports = {
    success: function (title, fieldName, fieldValue, inline) {
        if (isEmptyObject(creds.webhook.url)) {
          } else {
            hook.success(title, fieldName, fieldValue, inline)
        }
    },
    info: function (title, fieldName, fieldValue, inline) {
        if (isEmptyObject(creds.webhook.url)) {
        } else {
            hook.info(title, fieldName, fieldValue, inline)
        }
    },
    warn: function (title, fieldName, fieldValue, inline) {
        if (isEmptyObject(creds.webhook.url)) {
        } else {
            hook.warning(title, fieldName, fieldValue, inline)
        }
    },
    err: function (title, fieldName, fieldValue, inline) {
        if (isEmptyObject(creds.webhook.url)) {
        } else {
            hook.error(title, fieldName, fieldValue, inline)
        }
    }
}