# Backend Dockerfile - Node.js + Express
FROM node:20-alpine

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose backend REST API port
EXPOSE 5000

# Start backend server
CMD ["node", "server.js"]
