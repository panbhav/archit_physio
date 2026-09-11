const fs = require('fs');
const path = require('path');

const PLACE_URL = 'https://www.google.com/maps/place/Revital+Ortho+%26+Neuro+Physiotherapy+Centre/@27.5866429,76.6122806,17z/data=!4m6!3m5!1s0x397299067a72c725:0x712838a4e2bd684d!8m2!3d27.5866232!4d76.6146979!16s%2Fg%2F11kr9kp34z?hl=en';

async function fetchReviewCount() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (err) {
    console.error('Puppeteer not installed. Run "npm install puppeteer" first.');
    process.exit(1);
  }

  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--lang=en-US'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });

    console.log('Navigating to Google Maps place page...');
    await page.goto(PLACE_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Handle cookie consent dialog if presented
    try {
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText || '', btn);
        if (/accept all|i agree|agree|accept/i.test(text)) {
          console.log('Dismissing consent modal...');
          await btn.click();
          await new Promise(r => setTimeout(r, 2000));
          break;
        }
      }
    } catch (e) {
      // Non-fatal
    }

    await new Promise(r => setTimeout(r, 4000));

    // Try scrolling left pane to ensure reviews section loads
    try {
      await page.evaluate(() => {
        const pane = document.querySelector('div[role="main"]') || document.querySelector('.m6QErb');
        if (pane) pane.scrollTop = 1000;
      });
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      // Non-fatal
    }

    const reviewCount = await page.evaluate(() => {
      const bodyText = document.body.innerText || '';

      // Strategy 1: "5.0\n42 reviews"
      const ratingMatch = bodyText.match(/5\.0[\s\n]+(\d+)\s+reviews/i);
      if (ratingMatch) return parseInt(ratingMatch[1], 10);

      // Strategy 2: aria-label with "X reviews"
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const aria = el.getAttribute('aria-label') || '';
        const exactMatch = aria.match(/^(\d+)\s+reviews$/i);
        if (exactMatch) return parseInt(exactMatch[1], 10);

        const ratingAriaMatch = aria.match(/(\d+(?:\.\d+)?)\s*stars?\s*(\d+)\s+reviews/i);
        if (ratingAriaMatch) return parseInt(ratingAriaMatch[2], 10);
      }

      // Strategy 3: Tab or header text like "Reviews (42)"
      const tabMatch = bodyText.match(/Reviews\s*\((\d+)\)/i);
      if (tabMatch) return parseInt(tabMatch[1], 10);

      // Strategy 4: Top lines in innerText (first 60 lines)
      const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean);
      for (let i = 0; i < Math.min(lines.length, 60); i++) {
        const m = lines[i].match(/^(\d+)\s+reviews$/i);
        if (m) return parseInt(m[1], 10);
      }

      return null;
    });

    return reviewCount;
  } finally {
    await browser.close();
  }
}

function updateFiles(newCount) {
  const rootDir = path.resolve(__dirname, '..');
  const indexPath = path.join(rootDir, 'index.html');
  const transPath = path.join(rootDir, 'js', 'translations.js');

  let indexHtml = fs.readFileSync(indexPath, 'utf8');
  let transJs = fs.readFileSync(transPath, 'utf8');

  // 1. Schema JSON-LD reviewCount
  indexHtml = indexHtml.replace(/"reviewCount":\s*"\d+"/, `"reviewCount": "${newCount}"`);

  // 2. Hero Google rating badge
  indexHtml = indexHtml.replace(
    /(data-i18n="google_rating_badge">)5\.0 ★★★★★ \(\d+ Google Reviews\)(<\/span>)/,
    `$15.0 ★★★★★ (${newCount} Google Reviews)$2`
  );

  // 3. Testimonials section description
  indexHtml = indexHtml.replace(
    /(data-i18n="google_reviews_desc">Based on )\d+\+( verified patient reviews on Google for Revital Physiotherapy Centre, Alwar<\/p>)/,
    `$1${newCount}+$2`
  );

  // 4. Testimonials button
  indexHtml = indexHtml.replace(
    /(data-i18n="btn_view_google_reviews">Read All )\d+( Google Reviews<\/span>)/,
    `$1${newCount}$2`
  );

  // 5. Map card rating badge count
  indexHtml = indexHtml.replace(
    /(★<\/span>\s*<\/div>\s*<span class="text-\[11px\] text-slate-500 font-medium">\()\d+(\)<\/span>)/,
    `$1${newCount}$2`
  );

  // 6. Map card button
  indexHtml = indexHtml.replace(
    /(<svg class="w-3\.5 h-3\.5 text-amber-500 fill-current"[^>]*><path[^>]*\/><\/svg>\s*<span>)\d+( Reviews<\/span>)/,
    `$1${newCount}$2`
  );

  // Update translations.js (English)
  transJs = transJs.replace(
    /google_rating_badge:\s*"5\.0 ★★★★★ \(\d+ Google Reviews\)"/,
    `google_rating_badge: "5.0 ★★★★★ (${newCount} Google Reviews)"`
  );
  transJs = transJs.replace(
    /google_reviews_desc:\s*"Based on \d+\+ verified patient reviews on Google for Revital Physiotherapy Centre, Alwar"/,
    `google_reviews_desc: "Based on ${newCount}+ verified patient reviews on Google for Revital Physiotherapy Centre, Alwar"`
  );
  transJs = transJs.replace(
    /btn_view_google_reviews:\s*"Read All \d+ Google Reviews"/,
    `btn_view_google_reviews: "Read All ${newCount} Google Reviews"`
  );

  // Update translations.js (Hindi)
  transJs = transJs.replace(
    /google_rating_badge:\s*"5\.0 ★★★★★ \(\d+ गूगल समीक्षाएं\)"/,
    `google_rating_badge: "5.0 ★★★★★ (${newCount} गूगल समीक्षाएं)"`
  );
  transJs = transJs.replace(
    /google_reviews_desc:\s*"रिवाइटल फिजियोथेरेपी सेन्टर अलवर के लिए गूगल पर \d+\+ सत्यापित मरीज समीक्षाओं पर आधारित"/,
    `google_reviews_desc: "रिवाइटल फिजियोथेरेपी सेन्टर अलवर के लिए गूगल पर ${newCount}+ सत्यापित मरीज समीक्षाओं पर आधारित"`
  );
  transJs = transJs.replace(
    /btn_view_google_reviews:\s*"सभी \d+ गूगल समीक्षाएं पढ़ें"/,
    `btn_view_google_reviews: "सभी ${newCount} गूगल समीक्षाएं पढ़ें"`
  );

  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  fs.writeFileSync(transPath, transJs, 'utf8');
  console.log(`Successfully updated index.html and js/translations.js to ${newCount} reviews.`);
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const indexPath = path.join(rootDir, 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const currentMatch = indexHtml.match(/"reviewCount":\s*"(\d+)"/);
  const currentCount = currentMatch ? parseInt(currentMatch[1], 10) : 0;
  console.log(`Current website review count: ${currentCount}`);

  try {
    const liveCount = await fetchReviewCount();
    console.log(`Live Google Maps review count fetched: ${liveCount}`);

    if (!liveCount || isNaN(liveCount)) {
      console.warn('Could not extract review count from Google Maps. Keeping existing count.');
      return;
    }

    if (liveCount < currentCount) {
      console.warn(`Fetched count (${liveCount}) is less than current count (${currentCount}). Ignoring potential scrape glitch.`);
      return;
    }

    if (liveCount > currentCount) {
      console.log(`New reviews detected! Increasing from ${currentCount} to ${liveCount}...`);
      updateFiles(liveCount);
    } else {
      console.log(`Review count is already up-to-date (${currentCount}). No files modified.`);
    }
  } catch (err) {
    console.error('Error during review sync:', err);
    process.exit(1);
  }
}

main();
