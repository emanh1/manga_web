FROM node:24.0.2-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8080

CMD ["npm", "start"]