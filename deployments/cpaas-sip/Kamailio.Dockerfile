FROM alpine:latest
RUN apk update && apk add --no-cache \
    kamailio \
    kamailio-postgres \
    kamailio-presence \
    kamailio-utils \
    bash \
    net-tools \
    curl \
    iproute2 \
    sngrep

ENTRYPOINT ["kamailio", "-DD", "-E"]
