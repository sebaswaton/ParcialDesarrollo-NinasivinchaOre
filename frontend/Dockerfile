# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Variables inyectadas en build time desde docker-compose
ARG VITE_API_URL=http://localhost:8000
ARG VITE_GOOGLE_MAPS_KEY=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_KEY=$VITE_GOOGLE_MAPS_KEY

RUN npm run build

# Stage 2: serve con nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx para SPA (react-router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
