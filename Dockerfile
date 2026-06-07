# Stage 1: build the SvelteKit static site
FROM node:lts-alpine AS builder

WORKDIR /app

# Copy dependency manifests first so Docker layer cache works
COPY package.json package-lock.json* ./

# If there's no package-lock.json (Deno project), fall back to npm install
RUN npm install --legacy-peer-deps

# Copy the rest of the source
COPY . .

# Build the static site (outputs to /app/build)
RUN npm run build

# Stage 2: serve the static files with nginx
FROM nginx:alpine

# Copy the static build output
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config to handle SvelteKit's flat .html file routing
# (SvelteKit adapter-static outputs analyze.html, not analyze/index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
