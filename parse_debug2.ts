import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('debug_search.html', 'utf-8');
const $ = cheerio.load(html);

$('[data-to-posting]').each((i, el) => {
    if (i > 1) return;
    const container = $(el);
    const linkRaw = container.attr('data-to-posting');
    console.log("linkRaw:", linkRaw);
    console.log("Price:", container.find('[data-qa="POSTING_CARD_PRICE"]').text().trim());
    console.log("Location:", container.find('[data-qa="POSTING_CARD_LOCATION"]').text().trim());
});
