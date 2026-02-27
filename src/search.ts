import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');
chromium.use(stealth);
import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  price: string;
  location: string;
  features: string;
  description: string;
  image: string;
  link: string;
}

export async function searchZonaprop(url: string, limit: number = 10): Promise<{ properties: SearchResult[], html: string }> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires'
  });

  // Anti evasiones
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

  const page = await context.newPage();



  console.log(`Searching URL: ${url}`);
  const response = await page.goto(url, { waitUntil: 'load', timeout: 45000 });

  if (!response || response.status() === 403 || response.status() === 429 || response.status() >= 500) {
    await browser.close();
    throw new Error(`Bloqueo Anti-Bot o Error de Servidor en /search. Status HTTP: ${response ? response.status() : 'Unknown'}`);
  }

  // Wait explicitly to ensure CF bypass if needed, and for JS to render the cards
  await page.waitForTimeout(10000);

  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);

  const properties: SearchResult[] = [];
  const seenUrls = new Set<string>();

  $('[class*="posting-card-container"]').each((i, el) => {
    const container = $(el);
    const linkTag = container.closest('a').length ? container.closest('a') : container.find('a[href*="/propiedades/"]').first();
    let href = linkTag.attr('href') || container.attr('data-to-posting') || '';

    if (href && href.includes('/propiedades/') && !seenUrls.has(href)) {
      seenUrls.add(href);
      const link = href.startsWith('http') ? href.split('?')[0] : `https://www.zonaprop.com.ar${href.split('?')[0]}`;

      const rawText = container.text() || '';

      // Pricing
      const priceMatch = rawText.match(/USD\s*[\d\.]+/);
      const arsMatch = rawText.match(/\$\s*[\d\.]+/);
      const price = priceMatch ? priceMatch[0] : (arsMatch ? arsMatch[0] : '');

      // Location / Title
      let location = container.find('[class*="location"], [class*="Location"]').first().text().trim();
      if (!location) {
        location = container.find('h2, h3').first().text().trim();
      }

      // Image
      let image = '';
      container.find('img').each((_, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src') || '';
        if (src.includes('avisos') || src.includes('empresas') || src.match(/\d+x\d+/)) {
          image = src;
          return false; // break loop
        }
      });

      // Features
      const featuresArr: string[] = [];
      container.find('span, div[class*="feature"], div[class*="Feature"], li').each((_, span) => {
        const t = $(span).text().trim();
        if (t.match(/\d+\s*(m²|amb|baño|dorm)/i)) {
          featuresArr.push(t);
        }
      });
      const features = Array.from(new Set(featuresArr)).join(' • ');

      let titleMatch = location;
      if (!titleMatch || titleMatch.length < 5) titleMatch = price;

      let description = container.find('[class*="description"], [class*="Description"], [class*="postingCardDescription"]').first().text().trim();
      if (!description) description = rawText.substring(0, 150) + "...";

      if (price && properties.length < limit) {
        properties.push({
          title: titleMatch,
          price,
          link,
          image,
          features,
          location: location || '',
          description: description || ''
        });
      }
    }
  });

  // Generate Beautiful HTML representing the list
  const htmlOut = `
  <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333; border-bottom: 2px solid #ff5a5f; padding-bottom: 10px;">Resultados de Búsqueda</h2>
    <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 20px;">
      ${properties.map(p => `
      <a href="${p.link}" target="_blank" style="text-decoration: none; color: inherit;">
        <div style="display: flex; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; background: #fff;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.05)';">
          <div style="width: 280px; min-width: 280px; height: 200px; background-image: url('${p.image || 'https://via.placeholder.com/280x200?text=Sin+Foto'}'); background-size: cover; background-position: center;"></div>
          <div style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
            <div>
              <div style="font-size: 22px; font-weight: bold; color: #333; margin-bottom: 8px;">${p.price}</div>
              <div style="font-size: 14px; color: #666; margin-bottom: 8px; font-weight: 500;">${p.location}</div>
              <div style="font-size: 13px; color: #555; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 12px;">${p.features}</div>
              <div style="font-size: 13px; color: #777; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.description}</div>
            </div>
            <div style="align-self: flex-start; margin-top: 10px;">
              <span style="display: inline-block; background-color: #fce7e8; color: #ff5a5f; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Ver Detalles</span>
            </div>
          </div>
        </div>
      </a>`).join('')}
    </div>
  </div>`;

  return { properties, html: htmlOut };
}
