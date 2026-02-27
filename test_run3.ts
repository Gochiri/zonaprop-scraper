import { searchZonaprop } from './src/search.js';
import * as fs from 'fs';

async function run() {
    console.log("Starting search...");
    const data = await searchZonaprop('https://www.zonaprop.com.ar/departamentos-venta-palermo.html');
    console.log("Extracted:", data.properties.length);
    if (data.properties.length > 0) {
        console.log(data.properties[0]);
    }
}
run();
