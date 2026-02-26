import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import { searchZonaprop } from './src/search.js';

async function run() {
    const data = await searchZonaprop('https://www.zonaprop.com.ar/departamentos-venta-palermo.html');
    console.log("properties extracted:", data.properties.length);

    // Also save raw
    const stealth = StealthPlugin();
    chromium.use(stealth);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://www.zonaprop.com.ar/departamentos-venta-palermo.html', { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(10000);
    fs.writeFileSync('debug_search.html', await page.content());
    await browser.close();
    console.log('Saved debug html.');
}
run();
