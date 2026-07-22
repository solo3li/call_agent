FROM debian:bookworm-slim

# Install rtpengine from source for latest kernel module support
RUN apt-get update && apt-get install -y \
    rtpengine \
    rtpengine-utils \
    iptables \
    procps \
    && rm -rf /var/lib/apt/lists/*

# RTP port range: 20000-30000 (10,000 ports = 5,000 concurrent RTP streams)
EXPOSE 22222/udp
EXPOSE 20000-30000/udp

COPY rtpengine.conf /etc/rtpengine/rtpengine.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
