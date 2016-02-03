FROM golang:1.6-alpine

RUN apk add --update git gcc musl-dev

RUN cd $GOPATH \
  && mkdir -p src/github.com/compose pkg \
  && cd src/github.com/compose \
  && git clone https://github.com/albertzak/transporter \
  && cd transporter \
  && go get -a ./cmd/... \
  && go build -a ./cmd/...
