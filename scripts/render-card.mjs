// Рендер картки: HTML → PNG 2160×2160 (device_scale_factor=2).
// Використання: node scripts/render-card.mjs <input.html> <output-2x.png>
// Далі даунскейл: python3 scripts/downscale.py <output-2x.png> <final-1080.png>
import { chromium } from 'playwright';
import { existsSync } from 'fs';
import { resolve } from 'path';

const [, , inputHtml, outputPng] = process.argv;
if (!inputHtml || !outputPng) {
  console.error('Usage: node scripts/render-card.mjs <input.html> <output-2x.png>');
  process.exit(1);
}

// У середовищі Claude Code Chromium передвстановлено в /opt/pw-browsers
const preinstalled = '/opt/pw-browsers/chromium';
const launchOpts = existsSync(preinstalled) ? { executablePath: preinstalled } : {};

const browser = await chromium.launch(launchOpts);
const page = await browser.newPage({
  viewport: { width: 1080, height: 1080 },
  deviceScaleFactor: 2,
});
await page.goto('file://' + resolve(inputHtml));
await page.waitForTimeout(300); // даємо шрифту домалюватись
await page.screenshot({ path: outputPng, clip: { x: 0, y: 0, width: 1080, height: 1080 } });
await browser.close();
console.log('OK:', outputPng, '(2160×2160)');
