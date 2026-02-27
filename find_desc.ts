import * as cheerio from 'cheerio';
import * as fs from 'fs';

const html = fs.readFileSync('page_full.html', 'utf8');
const $ = cheerio.load(html);

// Find elements with text containing "Edificio Mario Roberto Alvarez"
let potentialSelectors: string[] = [];
$('*').each((i, el) => {
    // Only capture direct text
    if ($(el).children().length === 0) {
        const text = $(el).text();
        if (text && text.includes('Edificio Mario Roberto Alvarez') && text.length > 200) {
            potentialSelectors.push(`Tag: ${el.tagName}, class: ${$(el).attr('class')}, id: ${$(el).attr('id')}`);
        }
    }
    const t2 = $(el).text();
    if (t2 && t2.includes('Edificio Mario Roberto Alvarez') && t2.length > 200 && el.tagName === 'div') {
        potentialSelectors.push(`Tag: ${el.tagName}, class: ${$(el).attr('class')}, id: ${$(el).attr('id')}`);
    }
});

console.log([...new Set(potentialSelectors)]);
