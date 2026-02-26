import Fastify from 'fastify';
import { scrapeZonaprop } from './scraper';

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

const start = async () => {
  try {
    const port = 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Scraper API escuchando en http://localhost:${port}`);
    console.log(`Endpoint: POST http://localhost:${port}/api/scrape`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
