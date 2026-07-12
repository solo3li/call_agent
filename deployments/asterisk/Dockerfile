FROM alpine:latest

RUN apk add --no-cache asterisk asterisk-sample-config asterisk-curl bash postgresql-client jq

COPY sync.sh /sync.sh
COPY extensions.conf /etc/asterisk/extensions.conf

RUN chmod +x /sync.sh

# Expose SIP UDP
EXPOSE 5060/udp

CMD /usr/sbin/asterisk -f & /sync.sh
