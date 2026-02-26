export function generatePropertyHtml(data: any): string {
    const imagesHtml = (data.images || []).slice(0, 3).map((img: string, i: number) => {
        if (i === 0) {
            return `<div style="flex: 2; height: 400px;"><img src="${img}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px 0 0 12px;" /></div>`;
        }
        return `<div style="flex: 1; height: 195px;"><img src="${img}" style="width: 100%; height: 100%; object-fit: cover; ${i === 1 ? 'border-radius: 0 12px 0 0;' : 'border-radius: 0 0 12px 0;'}" /></div>`;
    }).join('');

    const secondaryImages = (data.images || []).slice(1, 3).map((img: string, i: number) =>
        `<img src="${img}" style="width: 100%; height: calc(50% - 5px); object-fit: cover; ${i === 0 ? 'border-radius: 0 12px 0 0; margin-bottom: 10px;' : 'border-radius: 0 0 12px 0;'}" />`
    ).join('');

    const featuresHtml = Object.entries(data.features || {}).map(([key, val]) =>
        `<div style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500;"><span style="color: #666; text-transform: capitalize;">${key}:</span> ${val}</div>`
    ).join('');

    return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 1200px; margin: 0 auto; color: #1a1a1a; padding: 20px;">
        <!-- Header / Location -->
        <div style="margin-bottom: 20px;">
            <div style="font-size: 14px; color: #484848; margin-bottom: 8px;">${data.location || ''}</div>
        </div>

        <!-- Image Gallery -->
        <div style="display: flex; gap: 10px; margin-bottom: 40px; height: 400px;">
            <div style="flex: 2; border-radius: 12px 0 0 12px; overflow: hidden;">
                ${data.images && data.images[0] ? `<img src="${data.images[0]}" style="width: 100%; height: 100%; object-fit: cover;" />` : ''}
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 10px; border-radius: 0 12px 12px 0; overflow: hidden;">
                ${secondaryImages}
            </div>
        </div>

        <!-- Content Grid -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 40px;">
            
            <!-- Main Content -->
            <div>
                <h1 style="font-size: 28px; margin: 0 0 20px 0;">${data.title || ''}</h1>
                <div style="font-size: 28px; font-weight: bold; margin-bottom: 30px;">${data.price || ''}</div>
                
                <!-- Features Grid -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 30px;">
                    ${featuresHtml}
                </div>

                <!-- Description -->
                <h3 style="font-size: 18px; margin-bottom: 16px;">Descripción</h3>
                <div style="font-size: 15px; line-height: 1.6; color: #484848; white-space: pre-wrap;">${data.description || ''}</div>
            </div>

            <!-- Sidebar / Form -->
            <div>
                <div style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); position: sticky; top: 20px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 18px;">Contactar anunciante</h3>
                    <input type="text" placeholder="Nombre" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 12px; font-family: inherit; font-size: 14px; box-sizing: border-box;" />
                    <input type="email" placeholder="Email" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 12px; font-family: inherit; font-size: 14px; box-sizing: border-box;" />
                    <input type="tel" placeholder="Teléfono" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 12px; font-family: inherit; font-size: 14px; box-sizing: border-box;" />
                    <textarea placeholder="Hola! Quiero que se comuniquen conmigo..." style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 20px; font-family: inherit; font-size: 14px; box-sizing: border-box; resize: vertical; min-height: 100px;"></textarea>
                    
                    <button style="width: 100%; padding: 14px; background-color: #ff5a5f; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">Contactar</button>
                    <button style="width: 100%; padding: 14px; background-color: #25d366; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 12px;">WhatsApp</button>
                </div>
            </div>
        </div>
    </div>
    `;
}
