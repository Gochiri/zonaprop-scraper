import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

chromium.use(StealthPlugin());

async function run() {
    console.log('Fetching HTML...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.zonaprop.com.ar/propiedades/veclapin-departamento-piso-en-venta-en-barrio-norte-capital-57986160.html', { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    fs.writeFileSync('page_full.html', html);
    const $ = cheerio.load(html);

    const scripts = $('script').map((i, el) => $(el).html()).get();
    let foundUrls: string[] = [];
    scripts.forEach(s => {
        if (s && s.includes('imgar.zonapropcdn.com')) {
            const matches = s.match(/https?:\/\/[^"'\s,]+(?:imgar\.zonapropcdn\.com|imgcdn\.zonaprop)[^"'\s,<>\\\)\]]+(?:jpg|jpeg|webp|png)/gi);
            if (matches) foundUrls.push(...matches);
        }
    });

    // also check standard img tags
    $('img').each((_, el) => {
        foundUrls.push($(el).attr('src') || $(el).attr('data-src') || '');
    });

    fs.writeFileSync('image_urls.json', JSON.stringify([...new Set(foundUrls)], null, 2));

    await browser.close();
    console.log('Done.');
}
run();
