FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Used directly by docker-compose as the `migrate` service (has the Prisma
# CLI + full node_modules) and as the base for the `builder` stage below.
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

FROM builder AS app-builder
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=app-builder /app/public ./public
COPY --from=app-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=app-builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN mkdir -p ./uploads && chown -R nextjs:nodejs ./uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
