FROM golang:1.26-alpine AS build
RUN apk add --no-cache git hugo
WORKDIR /src
# Copy alles eerst: go.mod's replace-directive verwijst naar lokale
# ./hugo-theme-ro/, dus die directory moet aanwezig zijn voordat Hugo
# de modules resolved. Eerdere `hugo mod get` op alleen go.mod/go.sum
# faalde de replace en pakte de oude canonical theme via network.
COPY . .
ARG BASE_PATH=/
RUN hugo --minify --baseURL "${BASE_PATH}"

FROM ghcr.io/rijksictgilde/nginx-base:2026.03.1
COPY --from=build /src/public/ /usr/share/nginx/html/
COPY nginx.default.conf.template /etc/nginx/templates/default.conf.template
ENV BASE_PATH=/
EXPOSE 8080
