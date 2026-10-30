FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p public/bootstrap/css public/bootstrap/js && \
    wget -qO public/bootstrap/css/bootstrap.min.css \
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" && \
    wget -qO public/bootstrap/js/bootstrap.bundle.min.js \
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
EXPOSE 3000
CMD ["node", "app.js"]
