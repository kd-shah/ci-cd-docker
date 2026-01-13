########################
# Build stage
########################
FROM node:22 AS build-stage

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

########################
# Production stage
########################
FROM node:22-slim

WORKDIR /app

COPY --from=build-stage /app/dist /app/build

RUN npm install -g serve

EXPOSE 80

CMD ["serve", "-s", "build", "-l", "80"]
