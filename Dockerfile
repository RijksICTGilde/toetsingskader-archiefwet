FROM golang:1.26.3-alpine AS build
ARG HUGO_VERSION=0.162.1
RUN apk add --no-cache git wget tar \
  && wget -qO- "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" \
     | tar -xz -C /usr/local/bin hugo
WORKDIR /src
# Copy alles eerst: go.mod's replace-directive verwijst naar lokale
# ./hugo-theme-ro/, dus die directory moet aanwezig zijn voordat Hugo
# de modules resolved.
COPY . .
ARG BASE_URL=
RUN if [ -n "$BASE_URL" ]; then \
      hugo --minify --baseURL "$BASE_URL"; \
    else \
      hugo --minify; \
    fi

FROM ghcr.io/rijksictgilde/nginx-base:2026.03.1
COPY --from=build /src/public/ /usr/share/nginx/html/
COPY nginx.default.conf.template /etc/nginx/templates/default.conf.template
# Runtime substitutie voor ${BASE_PATH} in nginx.default.conf.template.
ENV BASE_PATH=/
EXPOSE 8080
