import Fastify from 'fastify';
import { scrapeZonaprop } from './scraper.js';
import { searchZonaprop } from './search.js';

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
    if (!body || !body.url) {
      return reply.code(400).send({ success: false, error: 'Se requiere una URL en el body ({"url": "..."}).' });
    }

    const { url } = body;

    fastify.log.info(`Iniciando busqueda en: ${url}`);
    const result = await searchZonaprop(url);

    return reply.send({ success: true, data: result });
  } catch (error: any) {
    fastify.log.error(error);
    return reply.code(500).send({ success: false, error: 'Error interno del servidor en search.' });
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
