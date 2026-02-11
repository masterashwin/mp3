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

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


#Google: dockerfile react production small size nginx
#nginx.conf webserver configuration for react app