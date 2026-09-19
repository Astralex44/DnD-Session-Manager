# syntax=docker/dockerfile:1

# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# .env.production (tracked, no secrets — just VITE_API_BASE_URL) is picked up
# automatically by `vite build`'s default "production" mode.
RUN npm run build

# ── Runtime stage ────────────────────────────────────────────────────────────
# Static files only — nginx serves the Vite build output, no Node runtime needed.
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

# nginx:alpine ships an unprivileged "nginx" user, but the stock image still
# writes its cache dir as root by default — hand that over so the process can
# actually run as "nginx" below.
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx /usr/share/nginx/html /etc/nginx/conf.d

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
