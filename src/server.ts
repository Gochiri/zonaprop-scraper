import Fastify from 'fastify';
import { scrapeZonaprop } from './scraper.js';
import { searchZonaprop } from './search.js';
import { renderRebrandedPropertyHtml } from './rebranded_html.js';

const fastify = Fastify({
  logger: true
});

fastify.post('/api/scrape', async (request, reply) => {
  try {
    const body = request.body as any;
    if (!body || !body.url) {
      return reply.code(400).send({ success: false, error: 'Se requiere una URL en el body ({"url": "..."}).' });
    }

    const { url } = body;

    fastify.log.info(`Iniciando scrapeo de: ${url}`);
    const result = await scrapeZonaprop(url);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  } catch (error: any) {
    fastify.log.error(error);
    return reply.code(500).send({ success: false, error: 'Error interno del servidor.' });
  }
});

fastify.post('/api/search', async (request, reply) => {
  try {
    const body = request.body as any;
    if (!body) {
      return reply.code(400).send({ success: false, error: 'Cuerpo de la petición vacío.' });
    }

    // Check if it's a raw URL or filters
    if (!body.url && !body.tipo && !body.barrio) {
      return reply.code(400).send({ success: false, error: 'Debe proveer una "url" o filtros como "tipo", "operacion", "barrio".' });
    }

    const searchPayload = body.url ? body.url : body;

    fastify.log.info(`Iniciando busqueda con payload: ${JSON.stringify(searchPayload)}`);
    const result = await searchZonaprop(searchPayload);

    return reply.send({ success: true, data: result });
  } catch (error: any) {
    fastify.log.error(error);
    return reply.code(500).send({ success: false, error: 'Error interno del servidor en search.' });
  }
});

fastify.get('/vista/:id', async (request, reply) => {
  try {
    const { id } = request.params as any;
    const query = request.query as any;
    const { url } = query;

    if (!url) {
      return reply.code(400).type('text/html').send('<h1>Error: Falta la URL original en los parámetros.</h1>');
    }

    fastify.log.info(`Renderizando vista para propiedad ID: ${id}`);
    const result = await scrapeZonaprop(url);

    if (result.success && result.data) {
      const html = renderRebrandedPropertyHtml(result.data, id);
      return reply.type('text/html').send(html);
    } else {
      return reply.code(500).type('text/html').send(`<h1>Error al cargar la propiedad</h1><p>${result.error}</p>`);
    }
  } catch (error: any) {
    fastify.log.error(error);
    return reply.code(500).type('text/html').send('<h1>Error interno del servidor.</h1>');
  }
});

const start = async () => {
  try {
    const port = 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Scraper API escuchando en http://localhost:${port}`);
    console.log(`Endpoint: POST http://localhost:${port}/api/scrape`);
    console.log(`Endpoint: POST http://localhost:${port}/api/search`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
