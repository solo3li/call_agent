FROM debian:bookworm-slim AS builder

# Build FreeSWITCH from source for full control
RUN apt-get update && apt-get install -y \
    gnupg2 wget curl lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Use official FreeSWITCH 1.10 Debian packages
RUN wget -O - https://files.freeswitch.org/repo/deb/debian-release/fsstretch-archive-keyring.asc | apt-key add - \
    && echo "deb http://files.freeswitch.org/repo/deb/debian-release/ bookworm main" > /etc/apt/sources.list.d/freeswitch.list

FROM debian:bookworm-slim

# Install FreeSWITCH + required modules
RUN apt-get update && apt-get install -y \
    freeswitch \
    freeswitch-mod-sofia \
    freeswitch-mod-commands \
    freeswitch-mod-dialplan-xml \
    freeswitch-mod-dptools \
    freeswitch-mod-curl \
    freeswitch-mod-event-socket \
    freeswitch-mod-json-cdr \
    freeswitch-mod-opus \
    freeswitch-mod-g711 \
    freeswitch-mod-g722 \
    freeswitch-mod-sndfile \
    freeswitch-mod-tone-stream \
    freeswitch-mod-native-file \
    freeswitch-mod-say-en \
    freeswitch-mod-say-ar \
    freeswitch-mod-lua \
    freeswitch-mod-xml-curl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create required directories
RUN mkdir -p /etc/freeswitch /var/log/freeswitch /var/lib/freeswitch/recordings

# Copy all config files
COPY conf/ /etc/freeswitch/

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# SIP ports: 5060 (internal), 5080 (external/trunk)
# ESL port: 8021
EXPOSE 5060/udp 5060/tcp
EXPOSE 5080/udp 5080/tcp
EXPOSE 8021/tcp

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD fs_cli -x "status" | grep -q "UP" || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["freeswitch", "-nonat", "-nf"]
