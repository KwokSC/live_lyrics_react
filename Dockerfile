FROM node:latest as builder
WORKDIR /live-lyrics-react
COPY . .
RUN npm run build

FROM nginx:latest
EXPOSE 80
COPY custom-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /live-lyrics-react/build /usr/share/nginx/html