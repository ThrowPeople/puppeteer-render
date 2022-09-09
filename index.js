const puppeteer = require('puppeteer');
const uuid = require('uuid');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

var browser;
async function init() {
    browser = await puppeteer.launch();
}
var port = 8083;
init();

app.use(bodyParser.json());
app.use('/tmp', express.static(path.join(__dirname, 'tmp')))
app.post('/screenshot', async (req, res) => {
    try {
        url = req.body.url;
        var page = await browser.newPage();
        var id = uuid.v4();
        var response = await page.goto(url);

          statusCode = response.status();
        if (statusCode == 200) {
        
          const container = await page.$('#app');
          const boundingBox = await container.boundingBox();
          await page.screenshot({
              path: `./tmp/${id}.png`,
              clip: {
                  x: boundingBox.x,
                  y: boundingBox.y,
                  width: 2126,
                  height: boundingBox.height
              }
          });

          res.end(`http://localhost:${port}/tmp/${id}.png`);
        }
        if (statusCode == 403) {
          res.status(403).end('Forbidden');
        }
        if (statusCode == 500) {
          res.status(500).end('Internal Server Error');
        }
    } catch (error) {
        console.log(error)
        res.status(500).end('Puppteer internal error');
    }
});
app.listen(port)
console.log("server start");