FROM node:22-alpine AS deps
WORKDIR /workspace/backend
COPY backend/package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /workspace/backend
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=file:/app/data/sims.db
ENV UPLOAD_DIR_PATH=/app/uploads
ENV UPLOAD_URL_PATH=uploads
ENV LOG_DIR=/app/logs
ENV FRONTEND_DIST_DIR=/app/frontend-dist

COPY --from=build /workspace/backend/package*.json ./
COPY --from=build /workspace/backend/node_modules ./node_modules
COPY --from=build /workspace/backend/dist ./dist
COPY --from=build /workspace/backend/prisma ./prisma

RUN mkdir -p /app/data /app/uploads /app/logs

EXPOSE 4000

CMD ["node", "dist/src/server.js"]
