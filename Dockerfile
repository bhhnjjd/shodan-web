# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY client/package*.json ./client/
RUN cd client && npm install && npm run build
COPY server ./server
COPY client/dist ./client/dist

# Production image
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
COPY package*.json ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server/index.js"]
