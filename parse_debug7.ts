import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('debug_search.html', 'utf-8');
const $ = cheerio.load(html);

const properties: any[] = [];
const seenUrls = new Set<string>();

$('[class*="posting-card-container"]').each((i, el) => {
    const container = $(el);
    const linkTag = container.closest('a').length ? container.closest('a') : container.find('a[href*="/propiedades/"]').first();
    let href = linkTag.attr('href') || '';
    if (!href && container.attr('data-to-posting')) {
        href = container.attr('data-to-posting') || '';
    }

    if (href && href.includes('/propiedades/') && !seenUrls.has(href)) {
        seenUrls.add(href);
        const link = href.startsWith('http') ? href.split('?')[0] : `https://www.zonaprop.com.ar${href.split('?')[0]}`;

        const rawText = container.text() || '';

        // Pricing
        const priceElement = container.find('[class*="price"], [class*="Price"]');
        let price = priceElement.first().text().trim();
        if (!price) {
            const priceMatch = rawText.match(/USD\s*[\d\.]+/);
            const arsMatch = rawText.match(/\$\s*[\d\.]+/);
            price = priceMatch ? priceMatch[0] : (arsMatch ? arsMatch[0] : '');
        }

        // Location
        const locationElement = container.find('[class*="location"], [class*="Location"]');
        let location = locationElement.first().text().trim();
        if (!location) {
            location = container.find('h2, h3').first().text().trim();
        }

        let image = container.find('img').first().attr('src') || '';
        if (image && !image.startsWith('http')) image = container.find('img').first().attr('data-src') || '';

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
        const description = rawText.substring(0, 100);

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
