import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('debug_search.html', 'utf-8');
const $ = cheerio.load(html);

const cardHTML = $('div[class*="postingCard"]').first().html();
console.log(cardHTML ? cardHTML.substring(0, 1500) : "No card found");
