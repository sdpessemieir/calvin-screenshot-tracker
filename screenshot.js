const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  // Desktop resolutie
  await page.setViewport({ width: 1920, height: 1080 });

  // Ga naar website
  await page.goto('https://www.calvinklein.be/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log("✅ Page loaded");

  // Cookie banner accepteren (indien aanwezig)
  try {
    await page.click('#onetrust-accept-btn-handler');
    console.log("✅ Cookies accepted");
  } catch (e) {
    console.log("ℹ️ No cookie banner found");
  }

  // Wacht even zodat alles stabiel is
  await new Promise(resolve => setTimeout(resolve, 3000));

  // ✅ Scroll door de volledige pagina (lazy load fix)
  await autoScroll(page);

  // ✅ Extra wachten zodat alles geladen is
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Bestandsnaam met datum
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `screenshots/calvinklein-${date}.png`;

  // Maak map als die nog niet bestaat
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // ✅ Full page screenshot
  await page.screenshot({
    path: fileName,
    fullPage: true
  });

  console.log(`✅ Screenshot saved: ${fileName}`);

  await browser.close();
})();


// ✅ Functie om automatisch te scrollen
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
``
