import fs from 'fs';
import { generatePropertyHtml } from './src/rebranded_html';
import { generateSearchHtml } from './src/search';

const mockProperties = [
    {
        url: "https://www.zonaprop.com.ar/propiedades/clasificado/veclapin-venta-3-amb-con-terraza-y-cochera-palermo-chico-58358810.html",
        title: "Venta departamento de 3 ambientes con terraza y cochera - Palermo Chico. Un refugio urbano que combina elegancia y funcionalidad.",
        price: "USD 350.000",
        location: "República de la India 2700, Palermo Chico, Palermo",
        features: ["132 m² tot.", "3 amb.", "2 dorm.", "1 baño"],
        image: "https://imgar.zonapropcdn.com/avisos/1/00/58/35/88/10/360x266/2032665882.jpg?isFirstImage=true"
    },
    {
        url: "https://www.zonaprop.com.ar/propiedades/clasificado/veclapin-departamento-piso-en-venta-en-barrio-norte-capital-57986160.html",
        title: "Edificio Mario Roberto Alvarez. Piso de Categoría con Importantes Vistas al Rio, Barrio Parque y Plaza República de Chile.",
        price: "USD 1.150.000",
        location: "Av. Figueroa Alcorta 3000, Palermo Chico, Palermo",
        features: ["239 m² tot.", "3 amb.", "2 dorm.", "2 baños"],
        image: "https://imgar.zonapropcdn.com/avisos/1/00/57/98/61/60/360x266/2022335380.jpg?isFirstImage=true"
    }
];

const mockPropertyData = {
    title: 'Departamento Piso en Venta en Barrio Norte, Capital Federal',
    price: 'USD 1.150.000',
    location: 'Av. Figueroa Alcorta 3000',
    features: ['239 m² tot.', '239 m² cub.', '3 amb.', '2 baños', '1 coch.', '2 dorm.', '40 años', 'Frente', 'E'],
    description: 'Edificio Mario Roberto Alvarez. Piso de Categoría con Importantes Vistas al Rio, Barrio Parque y Plaza República de Chile. Living con balcón corrido. 2 dormitorios en suite, el principal con vestidor, 2 baños completos + toilette. Dependencia y baño de servicio. Cochera Fija. Vigilancia 24 hs. Grupo electrógeno. La superficie publicada y las medidas, son estimativas. Las fotos son meramente ilustrativas y no contractuales. Aires Split no incluidos en el precio. GUSTAVO ABASCAL PROPIEDADES',
    images: ['https://imgar.zonapropcdn.com/avisos/1/00/57/98/61/60/720x532/2022335380.jpg', 'https://imgar.zonapropcdn.com/avisos/resize/1/00/57/98/61/60/1200x1200/2022335380.jpg', 'https://imgar.zonapropcdn.com/avisos/1/00/57/98/61/60/360x266/2022335376.jpg', 'https://imgar.zonapropcdn.com/avisos/1/00/57/98/61/60/360x266/2022335382.jpg', 'https://imgar.zonapropcdn.com/avisos/1/00/57/98/61/60/360x266/2022335370.jpg'],
    url: 'https://www.zonaprop.com.ar/propiedades/clasificado/veclapin-departamento-piso-en-venta-en-barrio-norte-capital-57986160.html',
    expenses: '$ 50.000',
    amenities: ['Aire Acondicionado', 'Ascensor', 'Cochera Fija', 'Calefacción', 'Agua Corriente', 'Electricidad', 'Internet', 'Seguridad 24Hs'],
    zonapropId: '57986160',
    whatsappLink: 'https://wa.me/5491100000000?text=Hola'
};

const searchHtml = generateSearchHtml(mockProperties);
fs.writeFileSync('preview_results.html', searchHtml, 'utf8');
console.log('Saved preview_results.html');

const propertyHtml = generatePropertyHtml(mockPropertyData);
fs.writeFileSync('preview_vista.html', propertyHtml, 'utf8');
console.log('Saved preview_vista.html');
