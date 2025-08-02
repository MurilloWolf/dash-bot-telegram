# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY . .

# Build the application using our custom build system
RUN npm run build

# Final stage for app image
FROM base

# Install production dependencies only
COPY package-lock.json package.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/dist ./dist

# Create non-root user (bot doesn't need root)
RUN addgroup --system --gid 1001 botuser
RUN adduser --system --uid 1001 botuser
USER botuser

# Bot doesn't need to expose ports (it's not a web server)
# EXPOSE 3000

# Start the bot in production mode
CMD [ "npm", "run", "start" ]
