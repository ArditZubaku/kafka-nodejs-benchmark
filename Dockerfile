# =========================================================
# Stage 1: build native deps (node-gyp, python, compiler)
# =========================================================
FROM node:25-bookworm-slim AS builder

ENV NODE_ENV=production

# Build deps (ONLY in builder)
# TODO: pin these as well!!!
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  python3 \
  make \
  g++ \
  librdkafka-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# =========================================================
# Stage 2: runtime (small, clean)
# =========================================================
FROM node:25-bookworm-slim

ENV NODE_ENV=production \
  npm_config_loglevel=warn \
  npm_config_fund=false \
  npm_config_audit=false

# Runtime deps ONLY
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  librdkafka-dev \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy compiled node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

CMD ["node", "src/index.js"]
