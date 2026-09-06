# Step 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Allow cross-platform install for dependencies created on Windows
RUN npm install --include=optional --force

COPY . .

# Pass Cloud Run backend API URL during build if needed
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
