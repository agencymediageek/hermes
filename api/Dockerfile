FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ curl docker.io \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --production=false

COPY tsconfig.json ./
COPY src/ ./src/

EXPOSE 3001

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

CMD ["npx", "tsx", "src/index.ts"]
