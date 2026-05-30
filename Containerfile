FROM golang:1.26.3-alpine@sha256:f44b851aa23dfa219d18db6eab743203245429d355cb619cf96a2ffe2a84ba7a AS build
ARG HUGO_VERSION=0.162.1
ARG HUGO_SHA256=e34160095b6a6406af857fe212f50e4451f67ed1276b9bb0de13d08754980118
RUN apk add --no-cache git wget tar \
  && wget -qO /tmp/hugo.tar.gz "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" \
  && echo "${HUGO_SHA256}  /tmp/hugo.tar.gz" | sha256sum -c - \
  && mkdir -p /tmp/hugo-extract \
  && tar -xzf /tmp/hugo.tar.gz -C /tmp/hugo-extract hugo \
  && mv /tmp/hugo-extract/hugo /usr/local/bin/hugo \
  && chmod +x /usr/local/bin/hugo \
  && rm -rf /tmp/hugo-extract /tmp/hugo.tar.gz \
  && hugo version
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

FROM ghcr.io/rijksictgilde/nginx-base:2026.03.1@sha256:f931cf8677982c21c0bbb4dc00e46456f3afef84f4e10603a9722d4265cfa5fd
COPY --from=build /src/public/ /usr/share/nginx/html/
EXPOSE 8080
