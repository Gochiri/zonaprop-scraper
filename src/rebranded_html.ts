export function renderRebrandedPropertyHtml(propertyData: any, zonapropId: string): string {
    const images = propertyData.images || [];
    // Primera imagen destacada grande
    const firstImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/1200x800?text=Sin+Foto';

    // Resto de la galería (thumbnail grid)
    const restImages = images.slice(1, 5); // Mostrar 4 imagenes en la grilla para no sobrecargar
    const galleryHtml = restImages.map((img: string) => `<img src="${img}" alt="Propiedad" class="gallery-thumb" onclick="openLightbox(this.src)">`).join('');

    const title = propertyData.title || propertyData.location || 'Propiedad Exclusiva';
    const location = propertyData.location || title;
    const price = propertyData.price || 'Consultar Precio';
    const expenses = propertyData.expenses ? `<div class="expenses">+ ${propertyData.expenses}</div>` : '';
    const description = propertyData.description || 'Consulta para más información sobre esta propiedad.';

    let cleanDescription = description
        .replace(/Corredor Responsable:.*?\./gi, '')
        .replace(/Contacto:.*?\./gi, '')
        .replace(/Matricula .*?\./gi, '')
        .replace(/Leer descripci[óo]n completa/gi, '');

    const wpPhone = process.env.AGENCY_WHATSAPP || '5491100000000';
    const wpText = encodeURIComponent(`Hola, quisiera recibir más información sobre la propiedad código ${zonapropId} que vi en el catálogo exclusivo.`);
    const whatsappLink = `https://wa.me/${wpPhone}?text=${wpText}`;

    // Feature icon mapping
    const getIconForFeature = (feat: string) => {
        const f = feat.toLowerCase();
        if (f.includes('m² tot') || f.includes('m²')) return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 4h16v16H4z"></path><path d="M4 12h16"></path><path d="M12 4v16"></path></svg>`;
        if (f.includes('cub')) return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 3h18v18H3z"></path><path d="M9 3v18"></path></svg>`;
        if (f.includes('amb')) return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 4h16v16H4z"></path><path d="M9 4v16"></path><path d="M15 4v16"></path></svg>`;
        if (f.includes('baño') || f.includes('toilette')) return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M7 21a4 4 0 0 1-4-4v-1a2 0 0 1 2-2h14a2 0 0 1 2 2v1a4 0 0 1-4 4H7z"></path><path d="M7 14V8a5 5 0 0 1 10 0v6"></path><path d="M10 5V3"></path><path d="M14 5V3"></path></svg>`;
        if (f.includes('coch') || f.includes('estacionamiento')) return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 16H9m10 0h3v-3.15a1 0 0 0-.84-.99L16 11l-2.7-3.6a2 0 0 0-1.6-.8H9.3a2 0 0 0-1.6.8L5 11l-5.16.86a1 0 0 0-.84.99V16h3m14 0a2 0 1 1-4 0 2 0 0 1 4 0zM7 16a2 0 1 1-4 0 2 0 0 1 4 0z"></path></svg>`;
        if (f.includes('dorm')) return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 7v10M21 7v10M6 14h12M3 17h18M6 10h.01M18 10h.01M9 10h6"></path><rect x="5" y="7" width="14" height="10" rx="2" ry="2"></rect></svg>`;
        if (f.includes('año') || f.includes('antig')) return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
        if (f.includes('luminoso')) return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    };

    const features = propertyData.featuresList || [];
    const amenities = propertyData.amenities || [];

    const featuresHtml = features.map((f: string) => `
    <div class="flex flex-col items-center justify-center gap-2 min-w-[80px] text-center">
      <div class="text-zinc-700 opacity-80">${getIconForFeature(f)}</div>
      <div class="text-sm font-medium text-zinc-800">${f}</div>
    </div>
  `).join('');

    const amenitiesHtml = amenities.length > 0 ? `
    <div class="h-px bg-zinc-200 my-8"></div>
    <h3 class="text-xl font-bold text-zinc-900 mb-4">Amenities y Servicios</h3>
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-zinc-700 pl-5">
      ${amenities.map((a: string) => `<li class="list-disc">${a}</li>`).join('')}
    </ul>
  ` : '';

    let logoBase64 = '';
    try {
        const fs = require('fs');
        const path = require('path');
        const logoPath = path.join(process.cwd(), 'assets', 'JUEJATI naranja (1).png');
        logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
    } catch (e) {
        console.error('Logo not found', e);
    }

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Catálogo Exclusivo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-[#f9fafb] text-zinc-800 antialiased leading-relaxed">
    
    <!-- Header -->
    <header class="bg-white px-6 py-4 border-b border-zinc-200 flex justify-between items-center sticky top-0 z-50">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="h-8 object-contain">` : `<div class="font-extrabold text-xl text-zinc-900 tracking-tight">Catálogo Exclusivo</div>`}
        <div class="text-sm text-zinc-500 font-semibold px-3 py-1.5 bg-zinc-100 rounded-xl">
            Cód: ${zonapropId}
        </div>
    </header>

    <!-- Main Container matches preview_vista.html max-width 1100px -->
    <div class="max-w-[1100px] mx-auto px-5 py-8">
        
        <!-- Gallery Grid -->
        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 mb-8 h-[300px] md:h-[450px] rounded-2xl overflow-hidden">
            <img src="${firstImage}" class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" alt="Vista principal" onclick="openLightbox(this.src)">
            
            <div class="hidden md:grid grid-cols-2 grid-rows-2 gap-3 h-full">
                ${restImages.map((img: string) => `
                    <img src="${img}" class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" alt="Propiedad" onclick="openLightbox(this.src)">
                `).join('')}
            </div>
        </div>

        <!-- Content Card -->
        <div class="bg-white p-6 md:p-10 rounded-2xl border border-zinc-200 shadow-sm">
            
            <div class="flex items-baseline gap-4 mb-2">
                <div class="text-3xl md:text-4xl font-extrabold text-zinc-900 leading-none">${price}</div>
                ${expenses ? `<div class="text-base text-zinc-500 font-medium">+ ${expenses}</div>` : ''}
            </div>
            
            <div class="text-lg md:text-xl font-medium text-zinc-500 mb-8">${location}</div>
            
            <!-- Features Wrap Grid -->
            <div class="flex flex-wrap gap-8 mb-8 pb-8 border-b border-zinc-200 justify-center md:justify-start">
                ${featuresHtml}
            </div>

            <h3 class="text-xl font-bold text-zinc-900 mb-4">Descripción de la Propiedad</h3>
            <div class="text-base text-zinc-800 whitespace-pre-wrap leading-loose mb-8">
                ${cleanDescription}
            </div>

            ${amenitiesHtml}
        </div>
    </div>

    <!-- Extra space for floating button -->
    <div class="h-[120px]"></div>

    <!-- Floating WhatsApp Button (Fixed Bottom Right) -->
    <a href="${whatsappLink}" target="_blank" class="fixed bottom-8 right-8 bg-[#25D366] hover:-translate-y-0.5 hover:shadow-[0_15px_20px_-3px_rgba(37,211,102,0.4)] text-white px-8 py-4 rounded-full font-bold text-base shadow-[0_10px_15px_-3px_rgba(37,211,102,0.3)] flex items-center gap-3 transition-all z-[999]">
        <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.405-.883-.733-1.48-1.638-1.653-1.935-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.015c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Contactar Asesor
    </a>

    <!-- Lightbox Modal -->
    <div id="lightbox" class="fixed inset-0 bg-black/90 z-[9999] hidden justify-center items-center cursor-pointer" onclick="closeLightbox()">
        <span class="absolute top-5 right-8 text-white text-4xl font-bold cursor-pointer">&times;</span>
        <img id="lightbox-img" src="" class="max-w-[90vw] max-h-[90vh] rounded-lg object-contain">
    </div>

    <script>
        function openLightbox(src) {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox').classList.remove('hidden');
            document.getElementById('lightbox').classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
        function closeLightbox() {
            document.getElementById('lightbox').classList.add('hidden');
            document.getElementById('lightbox').classList.remove('flex');
            document.body.style.overflow = '';
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    </script>
</body>
</html>`;
}
