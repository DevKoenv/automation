const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const GoogleMeet = require('./google-meet');
const chalk = require('chalk');
const creds = require('./credentials.json');
const package = require('./package.json');
var data;
const discordWebhook = require('./discord-webhook');
const request = require('request');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

let email = creds.login.email;
let password = creds.login.password;
let head = creds.options.headless;
let strict = creds.options.strict;

obj = new GoogleMeet(email, password, head, strict);

// cache store
let url = {};
let ind = 0;

app.get('/', (req, res) => {
    res.render('index', { url, email, password })
});
app.post('/postlink', (req, res) => {
    ind++;
    url[ind] = {};
    url[ind].url = req.body.url;
    url[ind].startTime = Date.parse(req.body.startDate);
    url[ind].endTime = Date.parse(req.body.endDate);
    res.redirect("/");
});

request({
    url: 'http://api.atlasnet.ltd/automation/info.json',
    json: true
  }, function(error, response, body) {
    data = body;
    infoLog()
  });


const listener = app.listen(80 || process.env.PORT, () => {

    setInterval(() => {
        // console.log(url)
        for (x in url) {
            if (url[x].startTime < Date.now()) {
                //console.log(`Request for joining meet ${url[x].url}`);
                discordWebhook.success('Success', 'Starting Meet', `Joining Meet \n${url[x].url}`)
                obj.schedule(url[x].url, url[x]);
                url[x].startTime = url[x].endTime + 2000;
            }
            if (url[x].endTime < Date.now()) {
                //console.log(`Request for leaving meet ${url[x].url}`);
                discordWebhook.err('**Success**', 'Stopping Meet', `Leaving Meet \n${url[x].url}`)
                obj.end(url[x]);
                delete url[x]
            }
        }
    }, 1000)
    
    })

    function infoLog() {
        console.log(chalk.yellow('------------------------------------------------'))
        console.log(chalk.cyan('Username: ' + chalk.magenta(creds.login.email)))
        console.log(chalk.cyan('Password: ' + chalk.magenta('************')))
        console.log(chalk.cyan('Headless: ' + chalk.magenta(creds.options.headless)))
        console.log(chalk.cyan('Strict: ' + chalk.magenta(creds.options.strict)))
        console.log(chalk.cyan('Interface: ' + chalk.magenta('http://localhost:' + creds.options.port)))
        console.log(chalk.yellow('------------------------------------------------'))
        console.log(chalk.green('Author: ' + data.beta.author))
        console.log(chalk.green('Version: ' + package.version))
        if (data.beta.version > package.version) {
            console.log(chalk.blue.bold('New Update Available!'))
        } else {
            console.log(chalk.green('You are running the latest version'))
        }
        if (isEmptyObject(data.beta.info)) {
        } else {
            console.log(chalk.blue.bold(data.beta.info))
        }
        console.log(chalk.yellow('------------------------------------------------'))
    }