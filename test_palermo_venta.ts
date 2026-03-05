import { searchZonaprop } from './src/search.js';
import * as fs from 'fs';

(async () => {
    try {
        console.log('Iniciando prueba con: Palermo, venta, 3 ambientes, hasta 400000 dolares...');
        const filters = {
            tipo: 'departamentos',
            operacion: 'venta',
            barrio: 'palermo',
            ambientes: '3-ambientes',
            precioMax: '400000',
            moneda: 'usd'
        };
        const res = await searchZonaprop(filters, 5); // Limit 5 for faster testing
        console.log(`\n✅ Propiedades encontradas: ${res.properties.length}\n`);

        for (let i = 0; i < res.properties.length; i++) {
            const p = res.properties[i];
            console.log(`--- [Propiedad ${i + 1}] ---`);
            console.log(`Título: ${p.title}`);
            console.log(`Precio: ${p.price}`);
            console.log(`Ubicación: ${p.location}`);
            console.log(`Características: ${p.features}`);
            console.log(`Link: ${p.link}`);
            console.log('\n');
        }

        // Save to file just in case we need to inspect it
        fs.writeFileSync('test_palermo_results.json', JSON.stringify(res.properties, null, 2));
        console.log('Resultados guardados en test_palermo_results.json');

    } catch (e) {
        console.error('Error in searchZonaprop:', e);
    }
})();
