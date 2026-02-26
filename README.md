# ZonaProp Scraper

## Descripción del Proyecto
Este proyecto es un microservicio en Node.js diseñado para hacer web scraping de ZonaProp. Utiliza Playwright y Cheerio para la extracción de datos de manera robusta, consumiendo principalmente el estado estructurado (JSON-LD y estado de Next.js) en lugar de depender del parseo directo de HTML.

## Nuevos Requerimientos (Generación de Listado HTML)

El scraper no solo extraerá datos, sino que se encargará de generar la presentación de las propiedades encontradas. Los requerimientos para esta funcionalidad son:

1. **Generación de Listado HTML**: Crear un archivo o vista en HTML que muestre el listado de las propiedades encontradas.
2. **Diseño y Branding ("Código bonito")**: El HTML generado debe tener un diseño atractivo y estar personalizado con el branding de la inmobiliaria del cliente.
3. **Propiedades Linkeables**: Cada propiedad en el listado debe ser clickeable/linkeable.
4. **Ficha de Propiedad**: Al hacer clic en una propiedad, se debe acceder a una "ficha" detallada de la misma que debe incluir:
   - Datos e información de contacto de la inmobiliaria del cliente.
   - Galería de fotos de la propiedad.
   - Descripción completa de la propiedad.
   - Demás información relevante extraída.

## Tecnologías Utilizadas
- Node.js
- Playwright
- Cheerio
- TypeScript
