import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
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
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log(`Searching URL: ${url}`);
  const response = await page.goto(url, { waitUntil: 'load', timeout: 45000 });

  // Wait explicitly to ensure CF bypass if needed, and for JS to render the cards
  await page.waitForTimeout(10000);

  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);

  const properties: SearchResult[] = [];

  $('[data-to-posting="PROPERTY"]').first().parent().parent().find('[data-to-posting="PROPERTY"]').each((i, el) => {
    // Find the card container
    const container = $(el);

    const linkRaw = container.attr('data-to-posting');
    // If it doesn't look like a path, try a inside
    const aTag = container.find('a[target="_blank"]');
    const href = aTag.attr('href') || linkRaw;
    const link = href ? (href.startsWith('http') ? href : `https://www.zonaprop.com.ar${href}`) : '';

    const price = container.find('[data-qa="POSTING_CARD_PRICE"]').text().trim();
    const location = container.find('[data-qa="POSTING_CARD_LOCATION"]').text().trim();

    const featuresArr: string[] = [];
    container.find('[data-qa="POSTING_CARD_FEATURES"] span').each((_, span) => {
      featuresArr.push($(span).text().trim());
    });
    const features = featuresArr.join(' • ');

    const description = container.find('[data-qa="POSTING_CARD_DESCRIPTION"]').text().trim() || aTag.text().trim();

    // Try multiple ways to get the image
    let image = '';
    const imgTags = container.find('img');
    imgTags.each((_, img) => {
      const src = $(img).attr('src') || $(img).attr('data-src') || $(img).attr('data-flickity-lazyload');
      if (src && src.includes('imgar.zonapropcdn.com') && !src.includes('logo')) {
        if (!image) image = src;
      }
    });

    // Zonaprop sometimes has JSON-LD per card
    const jsonLd = container.find('script[type="application/ld+json"]').html();
    let title = description.substring(0, 60) + '...';
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.name) title = data.name;
        if (data.image && !image) image = data.image;
      } catch (e) { }
    }

    if (price && link && properties.length < limit) {
      properties.push({
        title,
        price,
        location,
        features,
        description,
        image,
        link
      });
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
