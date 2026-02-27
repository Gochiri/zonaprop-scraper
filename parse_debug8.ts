import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('debug_search.html', 'utf-8');
const $ = cheerio.load(html);

const properties: any[] = [];
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
        container.find('span, div[class*="feature"], div[class*="Feature"]').each((_, span) => {
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

        if (price) {
            properties.push({
                title: titleMatch,
                price,
                link,
                image,
                features,
                location: location,
                description: description
            });
        }
    }
});

console.log(properties.slice(0, 3));
