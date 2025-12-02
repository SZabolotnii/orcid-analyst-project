# Dockerfile for HuggingFace Spaces deployment
# Serves static Vite build + Express API proxy for Gemini

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy application files
COPY . .

# Build the Vite app
RUN npm run build

# Install express for runtime
RUN npm install express

# Expose port 7860 (HuggingFace Spaces default)
EXPOSE 7860

# Start the server
CMD ["node", "server.js"]
