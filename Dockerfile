# syntax=docker/dockerfile:1
# Production image: node build -> nginx (port 80).

# ---------- build ----------
FROM node:20.20.2-alpine3.23 AS build
WORKDIR /app
COPY package.json package-lock.json ./
# vite-imagetools@10 peer'i vite>=7 talab qiladi (loyihada vite@5) -> --legacy-peer-deps kerak.
# npm cache build'lar orasida saqlanadi (image'ga tushmaydi).
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit --no-fund
COPY . .
# Vite VITE_* ni build vaqtida bundle'ga yozadi.
# MAJBURIY: backend API manzili (https://...). Bo'sh bo'lsa build yiqiladi (jim fallback yo'q).
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
# Bot username ("@"siz). Bo'sh bo'lsa "Telegram botni ochish" bloki yashiriladi.
ARG VITE_TELEGRAM_BOT_USERNAME
ENV VITE_TELEGRAM_BOT_USERNAME=${VITE_TELEGRAM_BOT_USERNAME}
# Klinika kontaktlari (hammasi ixtiyoriy; sozlanmagan qo'ng'iroq tugmasi/ijtimoiy ikonka yashiriladi).
ARG VITE_CLINIC_PHONE
ENV VITE_CLINIC_PHONE=${VITE_CLINIC_PHONE}
ARG VITE_CLINIC_EMAIL
ENV VITE_CLINIC_EMAIL=${VITE_CLINIC_EMAIL}
ARG VITE_CLINIC_ADDRESS_UZ
ENV VITE_CLINIC_ADDRESS_UZ=${VITE_CLINIC_ADDRESS_UZ}
ARG VITE_CLINIC_ADDRESS_RU
ENV VITE_CLINIC_ADDRESS_RU=${VITE_CLINIC_ADDRESS_RU}
ARG VITE_CLINIC_ADDRESS_EN
ENV VITE_CLINIC_ADDRESS_EN=${VITE_CLINIC_ADDRESS_EN}
ARG VITE_CLINIC_LAT
ENV VITE_CLINIC_LAT=${VITE_CLINIC_LAT}
ARG VITE_CLINIC_LNG
ENV VITE_CLINIC_LNG=${VITE_CLINIC_LNG}
ARG VITE_CLINIC_OPENING_HOURS
ENV VITE_CLINIC_OPENING_HOURS=${VITE_CLINIC_OPENING_HOURS}
ARG VITE_TELEGRAM_CHANNEL_URL
ENV VITE_TELEGRAM_CHANNEL_URL=${VITE_TELEGRAM_CHANNEL_URL}
ARG VITE_INSTAGRAM_URL
ENV VITE_INSTAGRAM_URL=${VITE_INSTAGRAM_URL}
ARG VITE_YOUTUBE_URL
ENV VITE_YOUTUBE_URL=${VITE_YOUTUBE_URL}
ARG VITE_FACEBOOK_URL
ENV VITE_FACEBOOK_URL=${VITE_FACEBOOK_URL}
ARG VITE_WHATSAPP_URL
ENV VITE_WHATSAPP_URL=${VITE_WHATSAPP_URL}
# Ixtiyoriy: canonical, og:url, sitemap.xml va robots.txt'dagi Sitemap qatori uchun (https://domen).
ARG VITE_SITE_URL
ENV VITE_SITE_URL=${VITE_SITE_URL}
RUN case "$VITE_API_URL" in \
      http://*|https://*) ;; \
      *) echo "XATO: VITE_API_URL build-arg majburiy va http(s):// bilan boshlanishi kerak (hozir: '${VITE_API_URL}')" >&2; exit 1 ;; \
    esac
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
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

# ARG bosqichlar orasida o'tmaydi, shuning uchun qayta e'lon qilinadi.
ARG VERSION=dev
ARG COMMIT=unknown
LABEL org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$COMMIT

# nginx konteyner ichida 80-portda; cd.yml uni host'da 127.0.0.1:8083 ga chiqaradi (-p 127.0.0.1:8083:80).
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]