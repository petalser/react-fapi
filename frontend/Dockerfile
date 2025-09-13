# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy rest of the app
COPY . .

# Run dev server
CMD ["npm", "run", "dev"]
