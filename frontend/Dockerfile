# build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# final image
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# copy Nginx config over the default one
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
