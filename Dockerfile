# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

# Instalar dependencias primero (cacheado por Docker si no cambia package.json)
COPY package*.json ./
RUN npm ci

# Copiar código fuente y assets
COPY src/ ./src/
COPY assets/ ./assets/
COPY tsconfig.json ./

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npx", "tsx", "src/server.ts"]
