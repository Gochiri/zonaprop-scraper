import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('debug_search.html', 'utf-8');
const $ = cheerio.load(html);

console.log("Total posting devices:", $('div[class*="postingCard"]').length);

$('div[class*="postingCard"]').each((i, el) => {
    if (i > 3) return;
    const container = $(el);
    // Find link
    const aTag = container.find('a');
    let link = '';
    aTag.each((_, a) => {
        const href = $(a).attr('href');
        if (href && href.includes('/propiedades/')) link = href;
    });

    // Find price
    const priceText = container.text();
    const priceMatch = priceText.match(/USD\s*[\d\.]+/);
    const arsMatch = priceText.match(/\$\s*[\d\.]+/);
    const price = priceMatch ? priceMatch[0] : (arsMatch ? arsMatch[0] : '');

    // Title / location
    const titleMatch = container.find('h2, h3').text().trim() || container.find('[class*="Location"]').text().trim();

    console.log(`\n--- Card ${i} ---`);
    console.log("Link:", link);
    console.log("Price:", price);
    console.log("Title/Location match:", titleMatch);
});
