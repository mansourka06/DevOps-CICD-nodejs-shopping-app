FROM node:18-alpine

WORKDIR /app

COPY src/package*.json ./
RUN npm ci --omit=dev

COPY src/* ./

EXPOSE 3000
CMD ["sh", "-c", "mkdir -p /app/images && node app.js"]