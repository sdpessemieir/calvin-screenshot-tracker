const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto('https://www.calvinklein.be/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Wacht extra (site heeft veel JS)
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Cookie banner proberen wegklikken
  try {
    await page.click('button#onetrust-accept-btn-handler');
  } catch (e) {}

  const date = new Date().toISOString().slice(0, 10);
  const fileName = `screenshots/calvinklein-${date}.png`;

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  await page.screenshot({
    path: fileName,
    fullPage: true
  });

  console.log(`Screenshot saved: ${fileName}`);

  await browser.close();
})();
