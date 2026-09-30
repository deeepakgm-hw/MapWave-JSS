FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package.json package-lock.json* ./
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api

# Install dependencies and build
RUN npm install
RUN npm run build -w @campus-nav/api

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY packages/shared-types ./packages/shared-types
COPY apps/api/package.json ./apps/api/
RUN npm install --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/prisma ./apps/api/prisma

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
