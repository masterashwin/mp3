FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# build-time variable like docker build --build-arg REACT_APP_API_BASE_URL=http://localhost:8080 
ARG REACT_APP_API_BASE_URL
# runtimevariable like docker run -e REACT_APP_API_BASE_URL=http://localhost:8080
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/scgi_temp /tmp/uwsgi_temp

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build /usr/share/nginx/html
RUN chown -R appuser:appgroup /usr/share/nginx/html /tmp

USER appuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


#Google: dockerfile react production small size nginx
#nginx.conf webserver configuration for react app