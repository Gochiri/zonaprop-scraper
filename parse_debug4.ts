import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('debug_search.html', 'utf-8');
const $ = cheerio.load(html);

const properties: any[] = [];
const seenUrls = new Set<string>();

$('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/propiedades/') && !seenUrls.has(href)) {
        seenUrls.add(href);
        const link = href.startsWith('http') ? href.split('?')[0] : `https://www.zonaprop.com.ar${href.split('?')[0]}`;

        let container = $(el).closest('div[class*="postingCard"]');
        if (container.length === 0) {
            container = $(el).closest('div[class*="Card"]');
        }

        if (container.length) {
            const rawText = container.text();

            const priceMatch = rawText.match(/USD\s*[\d\.]+/);
            const arsMatch = rawText.match(/\$\s*[\d\.]+/);
            const price = priceMatch ? priceMatch[0] : (arsMatch ? arsMatch[0] : '');

            const titleMatch = container.find('h2, h3, [class*="Location"]').first().text().trim() || rawText.substring(0, 50);

            let image = container.find('img').first().attr('src') || '';
            if (image && !image.startsWith('http')) image = container.find('img').first().attr('data-src') || '';

            const featuresArr: string[] = [];
            container.find('span').each((_, span) => {
                const t = $(span).text().trim();
                if (t.includes('m²') || t.includes('amb') || t.includes('baño') || t.includes('dorm')) {
                    featuresArr.push(t);
                }
            });
            const featuresSet = Array.from(new Set(featuresArr));
            const features = featuresSet.join(' • ');

            if (price) {
                properties.push({
                    title: titleMatch,
                    price,
                    link,
                    image,
                    features,
                    location: titleMatch,
                    description: titleMatch
                });
            }
        }
    }
});

console.log(properties.slice(0, 5));
