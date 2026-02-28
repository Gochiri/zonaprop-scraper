import { searchZonaprop } from './src/search.js';
(async () => {
    try {
        console.log('Testing searchZonaprop with filters...');
        const res = await searchZonaprop({
            tipo: 'departamentos',
            operacion: 'alquiler',
            barrio: 'palermo',
            ambientes: '4-ambientes',
            precioMax: '5000',
            moneda: 'usd'
        }, 2);
        console.log('Success:', res.properties.length);
    } catch (e) {
        console.error('Error in searchZonaprop:', e);
    }
})();
