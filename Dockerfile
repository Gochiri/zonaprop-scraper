# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

# Instalar dependencias primero (cacheado por Docker si no cambia package.json)
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY src/ ./src/
COPY tsconfig.json ./

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npx", "tsx", "src/server.ts"]
