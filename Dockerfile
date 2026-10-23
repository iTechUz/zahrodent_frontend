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

# Build info: har commit'da o'zgaradi, shuning uchun cache'ni buzmaslik uchun
# `npm run build` dan KEYIN turadi (faqat shu qatlam qayta quriladi).
ARG VERSION=dev
ARG COMMIT=unknown
RUN printf '{"version":"%s","commit":"%s"}\n' "$VERSION" "$COMMIT" > dist/version.json

# ---------- runtime ----------
FROM nginx:alpine
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