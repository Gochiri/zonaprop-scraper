import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('debug_search.html', 'utf-8');
const $ = cheerio.load(html);

console.log("Total posting cards based on class:", $('[class*="postingCard"]').length);
console.log("Total data-to-posting:", $('[data-to-posting]').length);

$('[data-to-posting]').each((i, el) => {
    console.log(i, $(el).attr('data-to-posting'));
});
