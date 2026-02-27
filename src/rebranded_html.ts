export function renderRebrandedPropertyHtml(propertyData: any, zonapropId: string): string {
    const images = propertyData.images || [];
    // Primera imagen destacada grande
    const firstImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/1200x800?text=Sin+Foto';

    // Resto de la galería (thumbnail grid)
    const restImages = images.slice(1, 9); // Mostrar hasta 8 imagenes más en la grilla para no sobrecargar
    const galleryHtml = restImages.map((img: string) => `<img src="${img}" alt="Propiedad" class="gallery-thumb" onclick="openLightbox(this.src)">`).join('');

    const title = propertyData.title || propertyData.location || 'Propiedad Exclusiva';
    const location = propertyData.location || title;
    const price = propertyData.price || 'Consultar Precio';
    const expenses = propertyData.expenses ? `<div class="expenses">+ ${propertyData.expenses}</div>` : '';
    const description = propertyData.description || 'Consulta para más información sobre esta propiedad.';

    let cleanDescription = description
        .replace(/Corredor Responsable:.*?\./gi, '')
        .replace(/Contacto:.*?\./gi, '')
        .replace(/Matricula .*?\./gi, '');

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
    <div class="feature-item">
      <div class="feature-icon">${getIconForFeature(f)}</div>
      <div class="feature-text">${f}</div>
    </div>
  `).join('');

    const amenitiesHtml = amenities.length > 0 ? `
    <div class="divider"></div>
    <h3 class="section-title">Amenities y Servicios</h3>
    <ul class="amenities-list">
      ${amenities.map((a: string) => `<li>${a}</li>`).join('')}
    </ul>
  ` : '';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Catálogo Exclusivo</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #111827;
            --accent: #2563eb;
            --bg: #f9fafb;
            --surface: #ffffff;
            --text: #1f2937;
            --text-light: #4b5563;
            --border: #e5e7eb;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.6;
        }

        .header {
            background-color: var(--surface);
            padding: 16px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .brand { font-weight: 800; font-size: 20px; color: var(--primary); letter-spacing: -0.5px; }

        .container { max-width: 1100px; margin: 32px auto; padding: 0 20px; }

        /* Gallery Layout */
        .gallery-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            grid-template-rows: 450px;
            gap: 12px;
            margin-bottom: 32px;
            border-radius: 16px;
            overflow: hidden;
        }
        
        @media (max-width: 768px) {
            .gallery-container {
                grid-template-columns: 1fr;
                grid-template-rows: 300px;
            }
            .gallery-grid { display: none !important; }
        }

        .gallery-main {
            width: 100%;
            height: 100%;
            object-fit: cover;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .gallery-main:hover { opacity: 0.9; }

        .gallery-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 12px;
            height: 100%;
        }

        .gallery-thumb {
            width: 100%;
            height: 100%;
            object-fit: cover;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .gallery-thumb:hover { opacity: 0.8; }

        /* Main content */
        .content-card {
            background: var(--surface);
            padding: 40px;
            border-radius: 16px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .price-row {
            display: flex;
            align-items: baseline;
            gap: 16px;
            margin-bottom: 8px;
        }

        .price { font-size: 36px; font-weight: 800; color: var(--primary); line-height: 1; }
        .expenses { font-size: 16px; color: var(--text-light); }

        .location {
            font-size: 20px;
            font-weight: 500;
            color: var(--text-light);
            margin-bottom: 32px;
        }

        /* Features row based on screenshot */
        .features-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 32px;
            margin-bottom: 32px;
            padding-bottom: 32px;
            border-bottom: 1px solid var(--border);
        }

        .feature-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-width: 80px;
            text-align: center;
        }

        .feature-icon {
            color: var(--text);
            opacity: 0.8;
            margin-bottom: 4px;
        }

        .feature-text {
            font-size: 14px;
            font-weight: 500;
            color: var(--text);
        }

        .section-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 16px;
            color: var(--primary);
        }

        .description {
            font-size: 16px;
            color: var(--text);
            white-space: pre-wrap;
            line-height: 1.8;
            margin-bottom: 32px;
        }

        .amenities-list {
            margin-top: 16px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
            padding-left: 20px;
            color: var(--text);
        }

        .amenities-list li {
            margin-bottom: 4px;
        }

        .divider {
            height: 1px;
            background: var(--border);
            margin: 32px 0;
        }

        /* Floating WhatsApp Button */
        .floating-cta {
            position: fixed;
            bottom: 32px;
            right: 32px;
            background: #25D366; /* WhatsApp Green */
            color: white;
            padding: 16px 32px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 16px;
            text-decoration: none;
            box-shadow: 0 10px 15px -3px rgba(37, 211, 102, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            transition: transform 0.2s, box-shadow 0.2s;
            z-index: 999;
        }

        .floating-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 20px -3px rgba(37, 211, 102, 0.4);
        }

        @media (max-width: 768px) {
            .content-card { padding: 24px; }
            .features-grid { gap: 16px; justify-content: center; }
            .feature-item { min-width: 45%; }
            .floating-cta {
                bottom: 16px; right: 16px; left: 16px; justify-content: center;
            }
        }

        /* Lightbox modal for images */
        #lightbox {
            display: none;
            position: fixed;
            z-index: 9999;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.9);
            justify-content: center;
            align-items: center;
        }
        #lightbox img {
            max-width: 90vw;
            max-height: 90vh;
            border-radius: 8px;
            object-fit: contain;
        }
        #lightbox-close {
            position: absolute;
            top: 20px; right: 30px;
            color: white; font-size: 40px;
            cursor: pointer; font-weight: bold;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="brand">Catálogo Exclusivo</div>
        <div style="font-size: 14px; color: var(--text-light); font-weight: 600; padding: 6px 12px; background: #f3f4f6; border-radius: 12px;">Cód: ${zonapropId}</div>
    </header>

    <div class="container">
        <!-- Gallery Grid -->
        <div class="gallery-container">
            <img src="${firstImage}" class="gallery-main" alt="Vista principal" onclick="openLightbox(this.src)">
            <div class="gallery-grid">
                ${galleryHtml}
            </div>
        </div>

        <!-- Content -->
        <div class="content-card">
            <div class="price-row">
                <div class="price">${price}</div>
                ${expenses}
            </div>
            
            <div class="location">${location}</div>
            
            <div class="features-grid">
                ${featuresHtml}
            </div>

            <h3 class="section-title">Descripción de la Propiedad</h3>
            <div class="description">${cleanDescription}</div>

            ${amenitiesHtml}
        </div>
    </div>

    <!-- Extra space for floating button -->
    <div style="height: 120px;"></div>

    <a href="${whatsappLink}" target="_blank" class="floating-cta">
        <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.405-.883-.733-1.48-1.638-1.653-1.935-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.015c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Contactar Asesor
    </a>

    <div id="lightbox" onclick="this.style.display='none'">
        <span id="lightbox-close">&times;</span>
        <img id="lightbox-img" src="">
    </div>

    <script>
        function openLightbox(src) {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox').style.display = 'flex';
        }
    </script>
</body>
</html>`;
}
