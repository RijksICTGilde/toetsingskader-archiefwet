FROM golang:1.24-alpine AS build
RUN apk add --no-cache git hugo
WORKDIR /src
COPY go.mod go.sum ./
RUN hugo mod get
COPY . .
ARG BASE_PATH=/
RUN hugo --minify --baseURL "${BASE_PATH}"

FROM ghcr.io/rijksictgilde/nginx-base:2026.03.1
COPY --from=build /src/public/ /usr/share/nginx/html/
COPY nginx.default.conf.template /etc/nginx/templates/default.conf.template
ENV BASE_PATH=/
EXPOSE 8080
