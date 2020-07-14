FROM golang:1-alpine AS builder

ENV CGO_ENABLED=0
ENV GO111MODULE=on

RUN apk add git
RUN go get github.com/caddyserver/xcaddy/cmd/xcaddy@master
RUN xcaddy build v2.1.1 --with \
  github.com/caddy-dns/cloudflare


FROM caddy:2

COPY --from=builder /go/caddy /usr/bin/caddy
