########################
# Build stage
########################
FROM node:22 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

########################
# Production stage
########################
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/dist ./dist

# Copy prisma directory
COPY prisma ./prisma

# Copy startup script
COPY startup.sh ./
RUN chmod +x startup.sh

# Generate prisma client
RUN npx prisma generate

EXPOSE 5000

CMD ["sh", "startup.sh"]
