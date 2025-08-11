# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build/app.js"]
