import { chromium } from 'playwright-extra';
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
import type { Browser, BrowserContext } from 'playwright';
import * as cheerio from 'cheerio';

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

    try {
        const browser = await getBrowser();
        context = await browser.newContext({
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

        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

        if (!response || response.status() === 403 || response.status() === 429 || response.status() >= 500) {
            throw new Error(`Bloqueo Anti-Bot o Error de Servidor. Status HTTP: ${response ? response.status() : 'Unknown'}`);
        }

        const html = await page.content();
        const $ = cheerio.load(html);

        // 1. EXTRAER TÍTULO
        let title = $('h1').first().text().trim() || $('title').first().text().split('|')[0].trim();

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

        if (schemaData && schemaData.image) {
            if (Array.isArray(schemaData.image)) schemaData.image.forEach((i: string) => rawImages.add(i));
            else rawImages.add(schemaData.image);
        }

        if (rawImages.size === 0 && nextData) {
            const dataStr = JSON.stringify(nextData);
            const urls = dataStr.match(/https?:\/\/[^"'\s,]+(?:imgar\.zonapropcdn\.com|imgcdn\.zonaprop)[^"'\s,]+\.(?:jpg|jpeg|webp)/gi);
            if (urls) urls.forEach(u => rawImages.add(u));
        }

        if (rawImages.size === 0) {
            $('img').each((_, el) => {
                const src = $(el).attr('data-src') || $(el).attr('src');
                if (src && src.startsWith('http') && !src.includes('logo')) {
                    rawImages.add(src);
                }
            });
        }

        const cleanImages = Array.from(rawImages)
            .filter((u: string) => u.length < 500)
            .map((url: string) => {
                return url.split('?')[0]
                    .replace(/\/thumb\//, '/full/')
                    .replace(/\/small\//, '/large/')
                    .replace(/width=\d+/, 'width=1200')
                    .replace(/height=\d+/, 'height=900');
            })
            .slice(0, 20);

        // 6. CONSTRUIR RESULTADO ESTRUCTURADO
        const propertyData: any = {
            title,
            price: price ? `${currency} ${price.toLocaleString('es-AR')}` : 'Consultar',
            images: cleanImages,
            sourceUrl: url,
            details: {
                hasSchemaLd: !!schemaData,
                hasNextData: !!nextData
            }
        };

        if (schemaData) {
            if (schemaData.description) propertyData.description = schemaData.description;
            if (schemaData.address) {
                propertyData.location = typeof schemaData.address === 'string'
                    ? schemaData.address
                    : schemaData.address.streetAddress;
            }
            if (!price && schemaData.offers && schemaData.offers.price) {
                propertyData.price = `${schemaData.offers.priceCurrency || 'USD'} ${parseInt(schemaData.offers.price).toLocaleString('es-AR')}`;
            }
        }

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
