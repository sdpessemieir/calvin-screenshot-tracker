const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Desktop formaat
  await page.setViewport({ width: 1920, height: 1080 });

  // Ga naar website
  await page.goto('https://www.calvinklein.be/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Cookie banner accepteren (indien aanwezig)
  try {
    await page.click('#onetrust-accept-btn-handler');
    console.log("Cookies accepted");
  } catch (e) {
    console.log("No cookie banner found");
  }

  // Wacht even zodat alles stabiliseert
  await new Promise(resolve => setTimeout(resolve, 3000));

  // ✅ AUTO SCROLL (belangrijk!)
  await autoScroll(page);

  // ✅ EXTRA WACHTEN (laat alles laden)
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Bestandsnaam met datum
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `screenshots/calvinklein-${date}.png`;

  // Maak map als die niet bestaat
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // ✅ FULL PAGE SCREENSHOT
  await page.screenshot({
    path: fileName,
    fullPage: true
  });

  console.log(`✅ Screenshot saved: ${fileName}`);

  await browser.close();
})();


// ✅ FUNCTIE DIE SCROLLT DOOR HELE PAGINA
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 200;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
