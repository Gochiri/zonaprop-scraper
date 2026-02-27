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
  zonapropId?: string; // Cód de la propiedad
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
        // Extraer Código Zonaprop de la URL original
        let zonapropId = '';
        const idMatch = link?.match(/-(\d+)\.html/);
        if (idMatch && idMatch[1]) {
          zonapropId = idMatch[1];
        }

        properties.push({
          title: titleMatch,
          price,
          link: link || '',
          image,
          features,
          location: location || '',
          description: description || '',
          zonapropId
        });
      }
    }
  });

  // Read logo dynamically and cache it at module level to avoid blocking
  let logoBase64 = '';
  try {
    const fs = require('fs');
    const path = require('path');
    const logoPath = path.join(process.cwd(), 'assets', 'JUEJATI naranja (1).png');
    logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  } catch (e) {
    console.error('Logo not found', e);
  }

  const publicDomain = process.env.PUBLIC_URL || 'http://localhost:3000';

  const htmlOut = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resultados de Búsqueda</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>body { font-family: 'Inter', sans-serif; }</style>
  </head>
  <body class="bg-zinc-50 text-zinc-900 antialiased min-h-screen">
    
    <header class="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="h-10 object-contain">` : `<div class="font-extrabold text-2xl tracking-tight text-orange-600">Catálogo Exclusivo</div>`}
            <div class="text-sm font-semibold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                ${properties.length} Propiedades
            </div>
        </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="space-y-6">
        ${properties.map(p => {
    const vistaUrl = `${publicDomain}/vista/${p.zonapropId || 'error'}?url=${encodeURIComponent(p.link)}`;
    return `
            <a href="${vistaUrl}" target="_blank" class="block group cursor-pointer">
              <div class="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row h-auto md:h-56">
                <!-- Image Section -->
                <div class="w-full md:w-[320px] h-56 md:h-full shrink-0 overflow-hidden relative">
                  <img src="${p.image || 'https://via.placeholder.com/600x400?text=Sin+Foto'}" alt="Propiedad" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                  <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-zinc-800 shadow-sm">
                    Destacado
                  </div>
                </div>
                <!-- Content Section -->
                <div class="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div class="flex justify-between items-start mb-2">
                      <div class="text-2xl font-extrabold text-zinc-900 tracking-tight">${p.price}</div>
                      ${p.zonapropId ? `<span class="text-[10px] uppercase tracking-wider font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">Ref: ${p.zonapropId}</span>` : ''}
                    </div>
                    <h3 class="text-base font-semibold text-zinc-600 mb-3 truncate">${p.location}</h3>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 mb-4 pb-4 border-b border-zinc-100">
                      ${p.features.split('•').map((f: string) => `<span class="flex items-center gap-1">
                          <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                          ${f.trim()}
                      </span>`).join('')}
                    </div>
                    <p class="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                      ${p.description}
                    </p>
                  </div>
                  <div class="mt-4 flex justify-end">
                    <span class="inline-flex items-center justify-center rounded-lg bg-orange-50 text-orange-600 px-4 py-2 text-sm font-semibold group-hover:bg-orange-600 group-hover:text-white transition-colors duration-200">
                      Ver Propiedad
                      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </span>
                  </div>
                </div>
              </div>
            </a>`;
  }).join('')}
      </div>
    </main>
  </body>
  </html>`;

  return { properties, html: htmlOut };
}
