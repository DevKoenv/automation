// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const chalk = require('chalk');
const discordWebhook = require('./discord-webhook');


puppeteer.use(StealthPlugin())

class GoogleMeet {
    constructor(email, pass, head, strict) {
        this.email = email;
        this.pass = pass;
        this.head = head;
        this.strict = strict;
        this.browser;
        this.page;
    }
    async schedule(url) {
        try {
            // Open browser
            this.browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--use-fake-ui-for-media-stream'
                ],
            });
            this.page = await this.browser.newPage()
			
            await this.page.goto('https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin')

            // Login Start
            await this.page.type("input#identifierId", this.email, {
                delay: 0
            })
            await this.page.click("div#identifierNext")

            await this.page.waitForTimeout(3000)

            await this.page.type("input[name=password]", this.pass, {
                delay: 0
            })
            await this.page.click("div#passwordNext")

            await this.page.waitForTimeout(5000)

            await this.page.goto(url)

            console.log("inside meet page")

            await this.page.waitForTimeout(7000)

            try {
                await this.page.click("div.IYwVEf.HotEze.uB7U9e.nAZzG")
            } catch (err_audio) {
                console.log(chalk.yellow('------------------------------------------------'))
                console.log ("audio seems to disabled already")
				console.log(chalk.yellow('------------------------------------------------'))
				console.log(err_audio)
                console.log(chalk.yellow('------------------------------------------------'))
                discordWebhook.err('**Error**', '**Audio Error**', err_audio);
            }

            await this.page.waitForTimeout(1000)

            try {
                await this.page.click("div.IYwVEf.HotEze.nAZzG")
            } catch (err_video) {
                console.log(chalk.yellow('------------------------------------------------'))
                console.log ("video seems to be disabled already")
				console.log(chalk.yellow('------------------------------------------------'))
                console.log(err_video)
				console.log(chalk.yellow('------------------------------------------------'))
                discordWebhook.err('**Error**', '**Video Error**', err_video);
            }

            // sanity check (connect only if both audio and video are muted) :P
            if (this.strict) {
                let audio = await this.page.evaluate('document.querySelectorAll("div.sUZ4id")[0].children[0].getAttribute("data-is-muted")')
                let video = await this.page.evaluate('document.querySelectorAll("div.sUZ4id")[1].children[0].getAttribute("data-is-muted")')

                if (audio === "false" || video === "false") {
                    console.log ("Not joining meeting. We couldn't disable either audio or video from the device.\nYou may try again.")

                    discordWebhook.warn('**Warning**', 'Join Cancel', "Not joining meeting. We couldn't disable either audio or video from the device.\nYou may try again.");

                    return
                } 
                //console.log ("all set!!")
            }

            await this.page.waitForTimeout(1500)
            //console.log('clicking on join')
            await this.page.click("span.NPEfkd.RveJvd.snByac")

            //console.log("Successfully joined/Sent join request")
            discordWebhook.success('**Success**', 'Joined/Sent join request', 'In queue')
            
        }
        catch(err) {
            console.log(chalk.yellow('------------------------------------------------'))
            console.log(err)
            console.log(chalk.yellow('------------------------------------------------'))
        }
    }

    async end(goodbye_message) {
        await this.page.waitForTimeout(1500)

        await this.browser.close()
    }
}

module.exports = GoogleMeet;