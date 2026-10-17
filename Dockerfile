# syntax=docker/dockerfile:1
# Production image: node build -> nginx (port 80).

# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# TODO: lock fayl tuzatilgach `npm ci`ga o'tkazilsin (CI bilan bir xil sabab).
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
# Vite VITE_* ni build vaqtida bundle'ga yozadi.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---------- runtime ----------
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8071
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
