# --- Stage 1: build TypeScript -> JavaScript ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Stage 2: slim runtime image ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY admin.html ./admin.html

# Folder ini akan ditimpa oleh Fly Volume saat mount di /app/data,
# tapi tetap dibuat di image supaya app tidak crash kalau volume belum ke-mount.
RUN mkdir -p data

EXPOSE 8080
ENV PORT=8080

CMD ["node", "dist/server.js"]
