FROM node:22-alpine AS build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_APP_BASE_PATH=/
ARG VITE_API_BASE_URL=
ARG VITE_UPLOAD_BASE_URL=
ENV VITE_APP_BASE_PATH=${VITE_APP_BASE_PATH}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_UPLOAD_BASE_URL=${VITE_UPLOAD_BASE_URL}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY deploy/docker/frontend.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
