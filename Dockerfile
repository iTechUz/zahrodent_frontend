# syntax=docker/dockerfile:1
# Production image: node build -> nginx (port 80).

# ---------- build ----------
FROM node:20.20.2-alpine3.23 AS build
WORKDIR /app
COPY package.json package-lock.json ./
# TODO: lock fayl tuzatilgach `npm ci`ga o'tkazilsin (CI bilan bir xil sabab).
# npm cache build'lar orasida saqlanadi (image'ga tushmaydi).
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
# Vite VITE_* ni build vaqtida bundle'ga yozadi.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Build info: har commit'da o'zgaradi, shuning uchun cache'ni buzmaslik uchun
# `npm run build` dan KEYIN turadi (faqat shu qatlam qayta quriladi).
ARG VERSION=dev
ARG COMMIT=unknown
RUN printf '{"version":"%s","commit":"%s"}\n' "$VERSION" "$COMMIT" > dist/version.json

# ---------- runtime ----------
FROM nginx:1.31.8-alpine3.24
# `apk upgrade` base image'dan yangi Alpine paketlarini (masalan brotli-libs) tortadi —
# Trivy CRITICAL tekshiruvi o'tishi uchun.
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# ARG bosqichlar orasida o'tmaydi, shuning uchun qayta e'lon qilinadi.
ARG VERSION=dev
ARG COMMIT=unknown
LABEL org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$COMMIT

EXPOSE 8083
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]