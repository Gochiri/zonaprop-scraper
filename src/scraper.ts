import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
const stealth = StealthPlugin();
chromium.use(stealth);
import type { Browser, BrowserContext } from 'playwright';
import * as cheerio from 'cheerio';
import { generatePropertyHtml } from './scraper_html.js';

let globalBrowser: Browser | null = null;

async function getBrowser() {
    if (!globalBrowser) {
        globalBrowser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
    }
    return globalBrowser;
}

export async function scrapeZonaprop(url: string) {
    let context: BrowserContext | null = null;
    let page = null;

    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
    ];
    const randomUA: string = userAgents[Math.floor(Math.random() * userAgents.length)] as string;

    try {
        const browser = await getBrowser();
        context = await browser.newContext({
            userAgent: randomUA,
            viewport: { width: 1920, height: 1080 },
            locale: 'es-AR',
            timezoneId: 'America/Argentina/Buenos_Aires',
            extraHTTPHeaders: {
                'Accept-Language': 'es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
            }
        });

        // Anti evasiones reforzadas
        await context.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['es-AR', 'es', 'en'] });
            (window as any).chrome = { runtime: {} };
            const originalQuery = (window as any).navigator.permissions?.query;
            if (originalQuery) {
                (window as any).navigator.permissions.query = (parameters: any) =>
                    parameters.name === 'notifications'
                        ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
                        : originalQuery(parameters);
            }
        });

        page = await context.newPage();

        // Bloquear peticiones innecesarias para velocidad y ahorro de memoria
        await page.route('**/*', (route, request) => {
            const type = request.resourceType();
            const reqUrl = request.url();

            if (['font', 'stylesheet', 'media'].includes(type) || reqUrl.endsWith('.css')) {
                return route.abort();
            }
            if (reqUrl.includes('google-analytics') || reqUrl.includes('gtm') || reqUrl.includes('hotjar') || reqUrl.includes('datadog')) {
                return route.abort();
            }
            route.continue();
        });

        // Retry logic por si Zonaprop bloquea la primera vez
        let response = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            if (attempt > 1) {
                const delay = 3000 + Math.random() * 5000;
                console.log(`[scraper] Reintento ${attempt}/3 después de ${Math.round(delay)}ms...`);
                await page.waitForTimeout(delay);
            }
            response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            if (response && response.status() === 200) break;
            if (response && response.status() === 403 && attempt < 3) {
                console.log(`[scraper] 403 detectado en intento ${attempt}, reintentando...`);
                continue;
            }
        }

        if (!response || response.status() === 403 || response.status() === 429 || response.status() >= 500) {
            throw new Error(`Bloqueo Anti-Bot o Error de Servidor. Status HTTP: ${response ? response.status() : 'Unknown'}`);
        }

        const html = await page.content();
        const $ = cheerio.load(html);

        // 1. EXTRAER TÍTULO
        let title = $('h1').first().text().trim() || ($('title').first().text().split('|')[0] || '').trim();

        // 2. EXTRAER DATA SCHEMA.ORG (JSON-LD)
        let schemaData: any = null;
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const text = $(el).html();
                if (text && (text.includes('RealEstateListing') || text.includes('Product') || text.includes('Apartment'))) {
                    schemaData = JSON.parse(text);
                } else if (!schemaData && text) {
                    schemaData = JSON.parse(text);
                }
            } catch (e) { }
        });

        // 3. EXTRAER ESTADO NEXT.JS 
        let nextData: any = null;
        try {
            const nextScript = $('#__NEXT_DATA__').html();
            if (nextScript) {
                nextData = JSON.parse(nextScript);
            }
        } catch (e) { }

        // 4. PARSEO DE EMERGENCIA VISUAL (Fallback)
        let price = null;
        let currency = 'USD';

        const priceText = $('.price-items').first().text() || $('.price-value, .price').first().text() || '';
        if (priceText) {
            if (priceText.includes('ARS') || priceText.includes('$')) currency = 'ARS';
            if (priceText.includes('USD') || priceText.includes('U$S')) currency = 'USD';
            const match = priceText.replace(/\./g, '').match(/\d+/);
            if (match) price = parseInt(match[0], 10);
        }

        // 5. IMÁGENES
        const rawImages = new Set<string>();

        if (nextData) {
            const dataStr = JSON.stringify(nextData);
            const urls = dataStr.match(/https?:\/\/[^"'\s,]+(?:imgar\.zonapropcdn\.com|imgcdn\.zonaprop)[^"'\s,]+\.(?:jpg|jpeg|webp)/gi);
            if (urls) urls.forEach(u => rawImages.add(u));
        }

        if (schemaData && schemaData.image) {
            if (Array.isArray(schemaData.image)) schemaData.image.forEach((i: string) => rawImages.add(i));
            else rawImages.add(schemaData.image);
        }

        $('script').each((_, el) => {
            const s = $(el).html();
            if (s && s.includes('imgar.zonapropcdn.com')) {
                const matches = s.match(/https?:\/\/[^"'\s,]+(?:imgar\.zonapropcdn\.com|imgcdn\.zonaprop)[^"'\s,<>\)\]]+(?:jpg|jpeg|webp|png)/gi);
                if (matches) matches.forEach(m => rawImages.add(m));
            }
        });

        $('img').each((_, el) => {
            const src = $(el).attr('data-src') || $(el).attr('src');
            if (src && src.startsWith('http') && !src.includes('logo')) {
                rawImages.add(src);
            }
        });

        const cleanImages = Array.from(rawImages)
            .filter((u: string) => u.length < 500)
            .map((url: string) => {
                return (url.split('?')[0] || '')
                    .replace(/\/thumb\//, '/full/')
                    .replace(/\/small\//, '/large/')
                    .replace(/width=\d+/, 'width=1200')
                    .replace(/height=\d+/, 'height=900');
            })
            .slice(0, 30); // Up to 30 images as requested

        // Extracción de features y amenities exactos
        const formatText = (t: string) => t.replace(/\s+/g, ' ').trim();

        let featuresList: string[] = [];
        $('ul.section-icon-features li, .main-features li, [class*="icon-dir"], .section-main-features ul li').each((_, el) => {
            const text = formatText($(el).text());
            if (text && text.length < 30 && !text.toLowerCase().includes('ver más')) {
                featuresList.push(text);
            }
        });
        featuresList = [...new Set(featuresList)]; // Deduplicar

        let amenities: string[] = [];
        $('[class*="ameniti"] li, [class*="generales"] li, [class*="servicios"] li, #ver-mapa + div li, h2:contains("Características") + ul li, h2:contains("Adicionales") + ul li').each((_, el) => {
            const text = formatText($(el).text());
            if (text && text.length > 2 && text.length < 50) {
                amenities.push(text);
            }
        });
        // Remove those that are already in featuresList
        amenities = [...new Set(amenities)].filter(a => !featuresList.includes(a));

        let expenses = '';
        const expText = formatText($('.price-expenses').text() || $('[class*="expense"]').first().text());
        if (expText.toLowerCase().includes('expensas') || expText.includes('$')) {
            expenses = expText;
        }

        let fullDescription = '';
        const descNodes = $('#reactDescription, .section-description, [data-qa="DESC"], #longDescription');
        if (descNodes.length > 0) {
            fullDescription = descNodes.first().text().replace(/\s+/g, ' ').trim();
        }

        // 6. CONSTRUIR RESULTADO ESTRUCTURADO
        const propertyData: any = {
            title,
            price: price ? `${currency} ${price.toLocaleString('es-AR')}` : 'Consultar',
            expenses,
            images: cleanImages,
            featuresList,
            amenities,
            sourceUrl: url,
            description: fullDescription || (schemaData ? schemaData.description : ''),
            details: {
                hasSchemaLd: !!schemaData,
                hasNextData: !!nextData
            }
        };

        if (schemaData) {
            if (schemaData.address) {
                propertyData.location = typeof schemaData.address === 'string'
                    ? schemaData.address
                    : schemaData.address.streetAddress;
            }
            if (!price && schemaData.offers && schemaData.offers.price) {
                propertyData.price = `${schemaData.offers.priceCurrency || 'USD'} ${parseInt(schemaData.offers.price).toLocaleString('es-AR')}`;
            }
        }

        propertyData.html = generatePropertyHtml(propertyData);

        return {
            success: true,
            data: propertyData
        };

    } catch (error: any) {
        console.error('Error en el scraping:', error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        if (context) await context.close();
    }
}
