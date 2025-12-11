# Gunakan Node.js versi 20 Alpine (ringan)
FROM node:20-alpine AS base

# 1. Install dependencies
FROM base AS deps
WORKDIR /app
# Install libc6-compat (diperlukan untuk process.dlopen di Alpine)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# 2. Build aplikasi
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# 3. Production image (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Buat folder uploads agar bisa di-mount volume
RUN mkdir -p public/uploads
RUN chown nextjs:nodejs public/uploads

# Copy hasil build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
