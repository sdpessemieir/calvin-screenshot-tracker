const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();

    // ✅ ZEER BELANGRIJK: echte browser fingerprint
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setViewport({ width: 1920, height: 1080 });

    // ✅ Extra headers
    await page.setExtraHTTPHeaders({
      'accept-language': 'nl-BE,nl;q=0.9,en;q=0.8'
    });

    // ✅ Retry mechanisme (belangrijk!)
    let success = false;

    for (let i = 0; i < 3; i++) {
      try {
        await page.goto('https://www.calvinklein.be/', {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        success = true;
        break;
      } catch (err) {
        console.log(`Retry ${i + 1} failed`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    if (!success) {
      throw new Error("Page failed to load after retries");
    }

    console.log("✅ Page loaded");

    // Cookies
    try {
      await page.click('#onetrust-accept-btn-handler', { timeout: 5000 });
      console.log("✅ Cookies accepted");
    } catch {
      console.log("ℹ️ No cookie banner");
    }

    await new Promise(r => setTimeout(r, 3000));

    // Scroll
    await autoScroll(page);
    await new Promise(r => setTimeout(r, 3000));

    const date = new Date().toISOString().slice(0, 10);
    const fileName = `screenshots/calvinklein-${date}.png`;

    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    await page.screenshot({
      path: fileName,
      fullPage: true
    });

    console.log("✅ Screenshot saved");

    await browser.close();

  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  }
})();

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
