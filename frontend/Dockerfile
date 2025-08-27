# Build stage
FROM node:18-alpine AS build

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Final stage (only outputs static files, no server)
FROM alpine:3.18

WORKDIR /dist
COPY --from=build /app/dist .

# Keep container running for volume mounting
CMD ["sh", "-c", "echo 'Frontend build completed successfully' && tail -f /dev/null"]