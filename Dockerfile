FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies including Playwright browsers
RUN npm install
RUN npx playwright install chromium

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 3000

# Start the application using tsx
CMD ["npm", "run", "start"]
