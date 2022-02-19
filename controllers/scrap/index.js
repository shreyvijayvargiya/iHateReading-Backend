const puppeteer = require('puppeteer');
const { z } = require("zod");

const scrapLink = async(req, res) => {
    const response = {
        data: null,
        message: '',
        error: false
    };
    const link = req.body.link;   
    if(!link){
        response.error = true;
        response.message = 'Please send link';
        res.send(response)
    }else {
        const browser = await puppeteer.launch({});
        const page = await browser.newPage();
        await page.goto(link);
        const h1 = await page.title();
        await page.waitForSelector("h1");
        await page.waitForSelector("h2");
        const element = await page.$('h2');
        const h2 = await page.evaluate(element => element.textContent, element);
        response.data = {
            h1,
            h2,
            link
        };
        res.send(response)
    }
};

module.exports = scrapLink;
