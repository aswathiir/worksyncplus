# Use a lightweight Node runtime
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy app source
COPY . .

# Expose port and start
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
