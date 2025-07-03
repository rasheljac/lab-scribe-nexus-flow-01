
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies for any native modules
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files (frontend only)
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies (this will only install what's in the frontend package.json)
RUN npm install

# Copy source code (frontend only)
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY tsconfig*.json ./
COPY components.json ./

# Build the application and verify output
RUN npm run build && \
    ls -la dist/

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html/

# Verify files are copied correctly
RUN ls -la /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create healthcheck script
RUN echo '#!/bin/sh\nnginx -t' > /usr/local/bin/healthcheck.sh && \
    chmod +x /usr/local/bin/healthcheck.sh

# Set up permissions for nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Expose port
EXPOSE 80

# Health check using nginx -t
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Start nginx (using the default entrypoint which handles permissions correctly)
CMD ["nginx", "-g", "daemon off;"]
